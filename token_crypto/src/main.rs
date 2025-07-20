use rcgen::{Certificate, CertificateParams, DnType, DistinguishedName, IsCa, KeyPair as RcgenKeyPair, PKCS_ED25519};
use pem::{self, Pem}; // Asegúrate de que esto sea 'pem' si usas la versión 0.8
use std::fs;
use std::path::{Path, PathBuf};
use libp2p::{
    identity,
    swarm::{NetworkBehaviourEventProcess, SwarmEvent},
    futures::StreamExt,
    Multiaddr, PeerId, Swarm,
    gossipsub::{self, Message, MessageId, GossipsubEvent, GossipsubMessage, Topic, ValidationMode},
    mdns::{Mdns, MdnsEvent, MdnsConfig}, // MdnsConfig añadido
    noise::{NoiseConfig, X25519Spec}, // Eliminado Keypair si no se usa directamente
    yamux::YamuxConfig,
    Transport,
};
use std::{error::Error, task::{Context, Poll}, time::Duration};

// Esto será el "comportamiento de la red" de nuestro nodo libp2p.
// Combinamos mDNS (para descubrimiento local) y Gossipsub (para chat).
#[derive(libp2p::NetworkBehaviour)]
#[behaviour(out_event = "OutEvent", event_process = true)]
pub struct MyBehaviour {
    gossipsub: gossipsub::Gossipsub,
    mdns: Mdns,
}

#[allow(clippy::large_enum_variant)]
#[derive(Debug)]
pub enum OutEvent {
    Gossip(GossipsubEvent),
    Mdns(MdnsEvent),
}

// Implementaciones de NetworkBehaviourEventProcess para redirigir eventos
impl NetworkBehaviourEventProcess<GossipsubEvent> for MyBehaviour {
    fn inject_event(&mut self, event: GossipsubEvent) {
        // println!("Gossipsub Event: {:?}", event); // Descomentar para depuración
        // Aquí puedes procesar eventos de Gossipsub, como nuevos mensajes
        if let GossipsubEvent::Message { propagation_source, message_id, message } = event {
            println!(
                "Recibido mensaje {:?} de {:?} en tema {:?}",
                message_id,
                propagation_source,
                message.topic
            );
            if let Ok(msg_str) = String::from_utf8(message.data) {
                println!("  Mensaje: {}", msg_str);
            }
        }
    }
}

impl NetworkBehaviourEventProcess<MdnsEvent> for MyBehaviour {
    fn inject_event(&mut self, event: MdnsEvent) {
        match event {
            MdnsEvent::Discovered(list) => {
                for (peer, multiaddr) in list {
                    println!("mDNS: Peer descubierto: {} en {}", peer, multiaddr);
                    self.gossipsub.add_explicit_peer(&peer);
                }
            },
            MdnsEvent::Expired(list) => {
                for (peer, multiaddr) in list {
                    println!("mDNS: Peer expirado: {} en {}", peer, multiaddr);
                    self.gossipsub.remove_explicit_peer(&peer);
                }
            }
        }
    }
}

// Función para generar un nuevo par de claves y certificado (tu "token-llave")
// Lo hacemos como una función separada que devuelve los PEMs para reusar.
fn generate_token_keypair() -> Result<(String, String), Box<dyn Error>> {
    let mut cert_params = CertificateParams::new(vec![]);
    cert_params.distinguished_name = DistinguishedName::new();
    cert_params.distinguished_name.push(DnType::OrganizationName, "PeerChat Network");
    cert_params.distinguished_name.push(DnType::CommonName, "PeerChat Node");
    cert_params.is_ca = IsCa::NoCa;

    let key_pair = RcgenKeyPair::generate(&PKCS_ED25519)?;
    cert_params.key_pair = Some(key_pair);
    let cert = Certificate::from_params(cert_params)?;

    let cert_pem = cert.serialize_pem()?;
    let priv_key_pem = cert.serialize_private_key_pem();

    Ok((cert_pem, priv_key_pem))
}

// Función principal asíncrona
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    println!("Iniciando nodo PeerChat...");

    // 1. Definir la ruta donde se guardarán/cargarán las claves
    let home_dir = dirs::home_dir() // Usamos dirs para obtener el home del usuario actual
        .ok_or_else(|| "No se pudo encontrar el directorio home del usuario")?;

    let keys_dir = home_dir.join("aeon").join("keys"); // Ruta relativa a tu home
    fs::create_dir_all(&keys_dir)?; // Asegurarse de que el directorio existe

    let cert_path = keys_dir.join("token_cert.pem");
    let key_path = keys_dir.join("token_private_key.pem");

    // 2. Cargar o generar el par de claves (tu "token-llave")
    let identity_keypair = if key_path.exists() {
        println!("Cargando clave privada existente desde: {}", key_path.display());
        let priv_key_pem_str = fs::read_to_string(&key_path)?;

        // Requerimos parsear la clave PEM y luego serializarla a DER para libp2p
        let rcgen_key_pair = RcgenKeyPair::from_pem(&priv_key_pem_str)?;
        let libp2p_keypair = identity::Keypair::Ed25519(
            identity::ed25519::Keypair::try_from_bytes(
                &rcgen_key_pair.serialize_der_to_vec(),
            )?
        );
        libp2p_keypair

    } else {
        println!("Generando nuevo par de claves y certificado (Token-llave)...");
        let (cert_pem, priv_key_pem) = generate_token_keypair()?;
        fs::write(&cert_path, cert_pem.as_bytes())?;
        fs::write(&key_path, priv_key_pem.as_bytes())?;
        println!("Token-Certificado generado y guardado en: {}", keys_dir.display());

        // Convertir el KeyPair de rcgen a libp2p::identity::Keypair
        let rcgen_key_pair = RcgenKeyPair::from_pem(&priv_key_pem)?;
        identity::Keypair::Ed25519(
            identity::ed25519::Keypair::try_from_bytes(
                &rcgen_key_pair.serialize_der_to_vec(),
            )?
        )
    };

    let local_peer_id = identity_keypair.public().to_peer_id();
    println!("Peer ID local: {:?}", local_peer_id);

    // 3. Configurar el transporte de libp2p
    // Usamos Noise (para encriptación) y Yamux (para multiplexación de streams).
    let transport = libp2p::tcp::tokio::Transport::new(libp2p::tcp::Config::default().nodelay(true))
        .upgrade(libp2p::core::upgrade::Version::V1)
        .authenticate(NoiseConfig::new(identity_keypair.clone()).into_authenticated()) // Corregido: .vc_enabled() por .into_authenticated()
        .multiplex(YamuxConfig::default())
        .boxed();

    // 4. Configurar el comportamiento de la red (NetworkBehaviour)
    // Usaremos Gossipsub para la mensajería de chat y mDNS para descubrir peers en la red local.
    let message_id_fn = |message: &GossipsubMessage| {
        let mut s = blake3::Hasher::new();
        s.update(message.data.as_ref());
        MessageId::from(s.finalize().as_bytes())
    };
    let gossipsub_config = gossipsub::GossipsubConfigBuilder::default()
        .heartbeat_interval(Duration::from_secs(10)) // Intervalo de "latido"
        .validation_mode(ValidationMode::Strict)     // Modo de validación estricto
        .message_id_fn(message_id_fn)                // Función para IDs de mensajes
        .build()
        .expect("Configuración de Gossipsub inválida");
    let mut gossipsub = gossipsub::Gossipsub::new(
        gossipsub::MessageAuthenticity::Signed(identity_keypair.clone()),
        gossipsub_config,
    )
    .expect("No se pudo crear Gossipsub");

    let chat_topic = Topic::new("chat"); // Tema para el chat
    gossipsub.subscribe(&chat_topic)?;

    let mdns = Mdns::new(MdnsConfig::default()).await?; // Para descubrimiento de peers locales

    let behaviour = MyBehaviour { gossipsub, mdns };

    // 5. Crear el Swarm de libp2p
    let mut swarm = Swarm::new(transport, behaviour, local_peer_id);

    // 6. Escuchar en una dirección para recibir conexiones
    let listen_addr: Multiaddr = "/ip4/0.0.0.0/tcp/0".parse()?; // Escucha en cualquier IP, puerto aleatorio
    swarm.listen_on(listen_addr)?;

    // 7. Bucle principal del Swarm (maneja eventos de la red)
    println!("Nodo libp2p iniciado. Escuchando en direcciones:");
    for addr in Swarm::listeners(&swarm) {
        println!("  {}", addr);
    }

    loop {
        tokio::select! {
            event = swarm.select_next_some() => {
                match event {
                    SwarmEvent::NewListenAddr { address, .. } => {
                        println!("Swarm está escuchando en {}", address);
                    },
                    SwarmEvent::Behaviour(out_event) => {
                        match out_event {
                            OutEvent::Gossip(gossip_event) => {
                                // Procesar eventos Gossipsub ya se hace en NetworkBehaviourEventProcess
                                // Pero aquí puedes manejar eventos específicos si es necesario
                            },
                            OutEvent::Mdns(mdns_event) => {
                                // Procesar eventos mDNS ya se hace en NetworkBehaviourEventProcess
                            },
                        }
                    },
                    _ => {} // Ignorar otros eventos por ahora
                }
            }
        }
    }
}
