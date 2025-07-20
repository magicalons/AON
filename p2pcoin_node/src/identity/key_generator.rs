// src/identity/key_generator.rs

// Usamos el Keypair de libp2p directamente
use libp2p::identity::ed25519::Keypair; 

pub fn generate_new_keypair() -> Keypair {
    Keypair::generate() // libp2p::identity::ed25519::Keypair::generate() no necesita OsRng
}
