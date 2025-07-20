import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar vista EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para recibir datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar DB SQLite
const db = new sqlite3.Database('users.db', (err) => {
  if (err) return console.error('DB Error:', err.message);
  console.log('Conectado a SQLite');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// Rutas
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      return res.status(500).send('Error en DB');
    }
    if (row) {
      // Login correcto → redirige a chat con usuario en query
      res.redirect(`/chat?user=${encodeURIComponent(username)}`);
    } else {
      res.send('Login inválido');
    }
  });
});

app.get('/chat', (req, res) => {
  const user = req.query.user;
  if (!user) return res.redirect('/');
  res.render('chat', { user });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users(username, password) VALUES(?, ?)', [username, password], function(err) {
    if (err) {
      return res.send('Usuario ya existe o error');
    }
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
