// src/identity/key_store.rs

use libp2p::identity::ed25519::SecretKey as Ed25519SecretKeyAlias;

// Imports de sodiumoxide para la versión 0.4.0 (compatibilidad)
// Importamos gen_keypair, NONCEBYTES, PUBLICKEYBYTES, SECRETKEYBYTES
// y la función 'open'. La función 'box_' ya no se usa ni se importa.
use sodiumoxide::crypto::box_::curve25519xsalsa20poly1305::{
    gen_keypair, NONCEBYTES, PUBLICKEYBYTES, SECRETKEYBYTES,
    open, // La función 'open' devuelve Option<Vec<u8>>
    PublicKey as SodiumPublicKey, SecretKey as SodiumSecretKey,
    Nonce
};

use sodiumoxide::randombytes::randombytes;

use std::fs;
use std::path::Path;
use sha2::{Sha256, Digest};


// Define longitudes conocidas para Ed25519
// La constante PUBLIC_KEY_LEN ha sido prefijada con '_' para silenciar la advertencia 'unused constant'
const _PUBLIC_KEY_LEN: usize = 32;
const SECRET_KEY_LEN: usize = 32;
const NONCE_LEN: usize = NONCEBYTES;

/// Deriva una clave de cifrado de Sodiumoxide a partir de una contraseña/PIN.
pub fn derive_encryption_key(password: Option<&str>) -> Result<SodiumSecretKey, String> {
    let final_password_bytes = if let Some(p) = password {
        p.as_bytes().to_vec()
    } else {
        // Usa una "semilla" por defecto para el desarrollo si no se provee contraseña.
        // In production, this should be more robust.
        "default_strong_password_for_p2pcoin_dev".as_bytes().to_vec()
    };

    let mut hasher = Sha256::new();
    hasher.update(&final_password_bytes);
    let hash_result = hasher.finalize();

    SodiumSecretKey::from_slice(&hash_result[0..SECRETKEYBYTES])
        .ok_or_else(|| "Failed to derive encryption key from password".to_string())
}

/// Guarda una clave privada cifrada en un archivo.
pub fn save_encrypted_private_key(
    private_key: &Ed25519SecretKeyAlias,
    file_path: &Path,
    encryption_key: &SodiumSecretKey,
) -> Result<(), String> {
    // sk_eph ha sido prefijada con '_' para silenciar la advertencia 'unused variable'
    let (pk_eph, _sk_eph) = gen_keypair();
    let nonce_vec = randombytes(NONCE_LEN);
    let nonce_slice: &[u8; NONCE_LEN] = nonce_vec.as_slice().try_into().map_err(|_| "Invalid nonce length".to_string())?;

    let nonce = Nonce::from_slice(nonce_slice)
        .ok_or_else(|| "Failed to create Nonce from bytes".to_string())?;

    // Usamos la función 'seal' para encriptar la clave
    let boxed_key = sodiumoxide::crypto::box_::curve25519xsalsa20poly1305::seal(
        private_key.as_ref(),
        &nonce,
        &pk_eph,
        encryption_key,
    ); // <-- Punto y coma añadido aquí.

    let mut data_to_write = Vec::new();
    data_to_write.extend_from_slice(pk_eph.as_ref());
    data_to_write.extend_from_slice(nonce.as_ref());
    data_to_write.extend_from_slice(boxed_key.as_ref());

    fs::write(file_path, &data_to_write)
        .map_err(|e| format!("Failed to write encrypted key file: {}", e))?;

    Ok(())
}

/// Carga y descifra una clave privada de un archivo.
pub fn load_decrypted_private_key(
    file_path: &Path,
    encryption_key: &SodiumSecretKey,
) -> Result<Ed25519SecretKeyAlias, String> {
    let data = fs::read(file_path)
        .map_err(|e| format!("Failed to read encrypted key file: {}", e))?;

    if data.len() < PUBLICKEYBYTES + NONCE_LEN + SECRET_KEY_LEN {
        return Err("Encrypted key file is too short or corrupted".to_string());
    }

    let pk_eph_bytes: &[u8; PUBLICKEYBYTES] = data[0..PUBLICKEYBYTES]
        .try_into()
        .map_err(|_| "Failed to read ephemeral public key from file".to_string())?;
    let nonce_bytes: &[u8; NONCE_LEN] = data[PUBLICKEYBYTES..(PUBLICKEYBYTES + NONCE_LEN)]
        .try_into()
        .map_err(|_| "Failed to read nonce from file".to_string())?;
    let boxed_key_bytes = &data[(PUBLICKEYBYTES + NONCE_LEN)..];

    let pk_eph = SodiumPublicKey::from_slice(pk_eph_bytes)
        .ok_or_else(|| "Failed to parse ephemeral public key from file data".to_string())?;

    let nonce = Nonce::from_slice(nonce_bytes)
        .ok_or_else(|| "Failed to create Nonce from file bytes".to_string())?;

    // Usamos la función 'open' para desencriptar la clave. Devuelve Result<Vec<u8>, ()>
    let decrypted_bytes = open(
        boxed_key_bytes,
        &nonce,
        &pk_eph,
        encryption_key,
    )
    .map_err(|_| "Failed to decrypt private key. Incorrect password or corrupted file?".to_string())?;

    // Usamos `from_bytes` directamente en el `Vec<u8>` retornado.
    Ed25519SecretKeyAlias::from_bytes(decrypted_bytes)
        .map_err(|e| format!("Failed to parse decrypted Ed25519 SecretKey: {}", e))
}
