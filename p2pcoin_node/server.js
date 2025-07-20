const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// BD
const db = new sqlite3.Database('db.sqlite');

// Inicializa tablas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    profile TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    detail TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Ruta para subir un perfil eSIM (JSON)
app.post('/upload', (req, res) => {
  const { id, profile } = req.body;
  const encrypted = crypto.createHash('sha256').update(profile).digest('hex');

  db.run(`INSERT INTO profiles (id, profile) VALUES (?, ?)`, [id, encrypted], (err) => {
    if (err) return res.status(500).send('Error al guardar el perfil');
    db.run(`INSERT INTO audits (action, detail) VALUES (?, ?)`, ['UPLOAD', `Perfil ${id}`]);
    res.send('Perfil cargado correctamente');
  });
});

// Obtener perfil por ID
app.get('/profile/:id', (req, res) => {
  const id = req.params.id;
  db.get(`SELECT profile FROM profiles WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return res.status(404).send('Perfil no encontrado');
    db.run(`INSERT INTO audits (action, detail) VALUES (?, ?)`, ['DOWNLOAD', `Perfil ${id}`]);
    res.send({ id, encrypted: row.profile });
  });
});

// Ver auditoría
app.get('/audits', (req, res) => {
  db.all(`SELECT * FROM audits ORDER BY timestamp DESC LIMIT 100`, [], (err, rows) => {
    if (err) return res.status(500).send('Error al consultar auditoría');
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor SM-DP+ privado corriendo en http://localhost:${PORT}`);
});
