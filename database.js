import Database from 'better-sqlite3';

const db = new Database('users.db');

// Crear tabla de usuarios
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`).run();

// Crear tabla de mensajes
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    recipient TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

export function addUser(username, password) {
  try {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, password);
    return true;
  } catch (err) {
    return false;
  }
}

export function validateUser(username, password) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
  return stmt.get(username, password) || null;
}

export function saveMessage(sender, recipient, content) {
  const stmt = db.prepare('INSERT INTO messages (sender, recipient, content) VALUES (?, ?, ?)');
  stmt.run(sender, recipient, content);
}

export function getMessagesForUser(username) {
  const stmt = db.prepare('SELECT * FROM messages WHERE recipient = ? ORDER BY timestamp ASC');
  return stmt.all(username);
}
