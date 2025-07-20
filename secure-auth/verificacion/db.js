const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./verificados.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    otp TEXT,
    phone TEXT,
    telegram TEXT,
    verified INTEGER DEFAULT 0
  )`);
});

module.exports = db;
