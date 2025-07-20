// src/main.rs
// Importaciones mínimas para un nodo P2P básico y SurrealDB
use libp2p::{
    identity,
    core::PeerId, // <-- ¡CORRECCIÓN AQUÍ!
};
use std::error::Error;

// Importaciones de SurrealDB
use surrealdb::{engine::local::{Db, File}, Surreal};

// Importación de env_logger
use env_logger;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    env_logger::init();

    // INICIALIZACIÓN Y CONEXIÓN A SURREALDB
    println!("🚀 Conectando a SurrealDB...");
    let db = Surreal::new::<File>("data.db").await?;
    db.use_ns("p2pcoin").use_db("blockchain").await?;
    println!("✅ SurrealDB conectado y base de datos 'p2pcoin:blockchain' seleccionada.");

    // Generar o cargar la clave de identidad del nodo
    let local_key = identity::Keypair::generate_ed25519();
    let local_peer_id = PeerId::from(local_key.public());
    println!("ID de nodo local: {:?}", local_peer_id);

    println!("Nodo P2Pcoin básico iniciado. No hay funcionalidades de red avanzadas aún.");
    println!("Escribe 'testdb' y presiona Enter para probar la conexión a SurrealDB.");
    println!("Presiona Ctrl+C para salir.");

    // Bucle simple para mantener el programa corriendo y permitir entrada de consola
    // sin la complejidad del swarm de libp2p por ahora.
    let mut line = String::new();
    loop {
        std::io::stdin().read_line(&mut line)?;
        let trimmed_line = line.trim();
        println!("Comando recibido: {}", trimmed_line);

        if trimmed_line == "testdb" {
            println!("⚡️ Probando SurrealDB...");
            // Ejemplo: Insertar un registro simple
            let created: Vec<surrealdb::Response> = db.query("CREATE person SET name = 'Magic', age = 30").await?;
            println!("💾 Registro creado: {:?}", created);

            // Ejemplo: Seleccionar un registro
            let selected: Vec<surrealdb::Response> = db.query("SELECT * FROM person").await?;
            println!("🔎 Registros en 'person': {:?}", selected);
        } else if trimmed_line == "exit" {
            println!("Saliendo del nodo...");
            break;
        }

        line.clear(); // Limpiar la línea para la siguiente entrada
    }

    Ok(())
}
