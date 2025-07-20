// src/identity/recovery.rs

use bip39::Mnemonic; 
use libp2p::identity::ed25519::{Keypair, SecretKey}; 
use rand::rngs::OsRng; 
use rand::RngCore; 

/// Genera una nueva frase mnemotécnica de 12 palabras.
pub fn generate_mnemonic_phrase() -> String {
    let mut rng = OsRng;
    let mut entropy_bytes = [0u8; 16]; 
    rng.fill_bytes(&mut entropy_bytes); 

    let mnemonic = Mnemonic::from_entropy(&entropy_bytes)
        .expect("Failed to generate mnemonic");
    
    mnemonic.to_string()
}

/// Deriva un Keypair Ed25519 a partir de una frase mnemotécnica.
pub fn derive_keypair_from_mnemonic(mnemonic_phrase: &str) -> Result<Keypair, String> { 
    let mnemonic = Mnemonic::parse(mnemonic_phrase) 
        .map_err(|e| format!("Invalid mnemonic phrase: {}", e))?;

    let seed = mnemonic.to_seed(""); 

    const ED25519_SECRET_KEY_BYTES: usize = 32; 

    if seed.as_ref().len() < ED25519_SECRET_KEY_BYTES { 
        return Err(format!("Seed is too short ({}) to derive Ed25519 private key (requires {})", 
                           seed.as_ref().len(), ED25519_SECRET_KEY_BYTES));
    }

    let secret_key_bytes: [u8; ED25519_SECRET_KEY_BYTES] = seed.as_ref()[0..ED25519_SECRET_KEY_BYTES]
        .try_into()
        .map_err(|_| "Failed to convert seed slice to SecretKey array. Length mismatch.".to_string())?;
    
    // ¡CORRECCIÓN CLAVE AQUÍ! Usar from_bytes para SecretKey de libp2p
    SecretKey::from_bytes(secret_key_bytes) 
        .map(|secret_key| Keypair::from(secret_key)) 
        .map_err(|e| format!("Failed to create Ed25519 secret key from bytes: {}", e))
}
