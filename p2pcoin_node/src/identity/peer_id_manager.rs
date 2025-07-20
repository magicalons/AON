// src/identity/peer_id_manager.rs

use libp2p::identity::ed25519::Keypair as Ed25519Keypair; 
use libp2p::PeerId;
use libp2p::identity; 

/// Crea un libp2p PeerId a partir de un keypair ed25519.
pub fn create_peer_id_from_keypair(keypair: &Ed25519Keypair) -> PeerId { 
    // Convertir el Keypair ed25519 específico a libp2p::identity::Keypair (el enum general)
    // Usamos la sugerencia del compilador: envolverlo en la variante Ed25519 del enum.
    let libp2p_identity_keypair: identity::Keypair = identity::Keypair::Ed25519(keypair.clone()); 
    // Luego obtener el PublicKey genérico y de ahí el PeerId
    libp2p_identity_keypair.public().to_peer_id() 
}
