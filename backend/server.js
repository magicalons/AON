import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import { WebSocketServer } from 'ws';

const app = express();
const port = 4443;

// DB SQLite
const dbFile = path.join(process.cwd(), 'users.db');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'supersecreto',
  resave: false,
  saveUninitialized: false
}));

// Servir archivos públicos
app.use(express.static(path.join(process.cwd(), 'public')));

// Rutas básicas de registro y login (simplificadas)
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ error: 'Faltan datos' });
  const hashed = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashed], (err) => {
    if(err) return res.status(400).json({ error: 'Usuario ya existe' });
    res.json({ ok: true });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ error: 'Faltan datos' });
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if(err || !row) return res.status(401).json({ error: 'Usuario no encontrado' });
    if(!bcrypt.compareSync(password, row.password)) return res.status(401).json({ error: 'Contraseña incorrecta' });
    req.session.userId = row.id;
    req.session.username = username;
    res.json({ ok: true });
  });
});

// HTTPS Certificados mkcert
const keyPath = path.join(process.cwd(), 'certs/key.pem');
const certPath = path.join(process.cwd(), 'certs/cert.pem');
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('Certificados TLS no encontrados en certs/');
  process.exit(1);
}
const server = https.createServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
}, app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Echo cifrado para demo, envía el mismo mensaje a todos los clientes
    wss.clients.forEach(client => {
      if(client.readyState === ws.OPEN) {
        client.send(message);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Servidor HTTPS escuchando en https://localhost:${port}`);
});
