// src/identity/mod.rs

use std::fs;
use std::path::Path;

use libp2p::{identity, PeerId}; // Ensure identity and PeerId are imported
use libp2p::identity::PublicKey as Libp2pPublicKey; // Import the generic PublicKey for clarity


// Re-export any public modules
pub mod key_store;
pub mod recovery;

/// Configures the node's identity.
/// Tries to load an existing key; if not found, generates a new one and saves it.
///
/// Returns the specific Ed25519 Keypair and its associated PeerId.
pub fn setup_identity(
    base_path: &Path,
) -> Result<(identity::ed25519::Keypair, PeerId), String> {
    let key_path = base_path.join("p2pcoin_key.pem");

    // Try to load an existing key
    if key_path.exists() {
        println!("Cargando clave de identidad existente desde: {:?}", key_path);
        let keypair_bytes = fs::read(&key_path)
            .map_err(|e| format!("Error al leer el archivo de clave: {}", e))?;

        let keypair = identity::Keypair::from_protobuf_encoding(&keypair_bytes)
            .map_err(|e| format!("Error al decodificar la clave: {}", e))?;

        // Ensure it's an Ed25519 key, which is what we expect for NoiseAuthenticated::xx
        match keypair {
            identity::Keypair::Ed25519(ed_key) => {
                // --- FINAL CORRECTION HERE ---
                // Convert the specific Ed25519 PublicKey to the generic libp2p::identity::PublicKey
                // using its Ed25519 variant, then create the PeerId from that.
                let peer_id = PeerId::from(Libp2pPublicKey::Ed25519(ed_key.public()));
                // --- END FINAL CORRECTION ---
                println!("Clave cargada exitosamente. Peer ID: {}", peer_id);
                Ok((ed_key, peer_id))
            },
            _ => Err("La clave cargada no es del tipo Ed25519. Por favor, borra p2pcoin_key.pem y reintenta.".to_string()),
        }
    } else {
        // Generate a new key if it doesn't exist
        println!("Generando nueva clave de identidad y guardándola en: {:?}", key_path);
        let new_keypair = identity::ed25519::Keypair::generate();

        // --- FINAL CORRECTION HERE ---
        // Convert the specific Ed25519 PublicKey to the generic libp2p::identity::PublicKey
        // using its Ed25519 variant, then create the PeerId from that.
        let peer_id = PeerId::from(Libp2pPublicKey::Ed25519(new_keypair.public()));
        // --- END FINAL CORRECTION ---

        // Convert to generic Keypair before to_protobuf_encoding()
        let encoded = identity::Keypair::Ed25519(new_keypair.clone()).to_protobuf_encoding()
            .map_err(|e| format!("Error al codificar la nueva clave: {}", e))?;

        fs::write(&key_path, encoded)
            .map_err(|e| format!("Error al guardar la nueva clave: {}", e))?;

        println!("Nueva clave generada y guardada. Peer ID: {}", peer_id);
        Ok((new_keypair, peer_id))
    }
}

// You can add other identity-related functions here or in separate modules
