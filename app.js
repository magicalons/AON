import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

let db;

async function initDB() {
  db = await open({
    filename: './users.db',
    driver: sqlite3.Database
  });
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
}

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.send(`<h1>Registro</h1>
    <form method="POST" action="/register">
      <input name="username" placeholder="Usuario" required />
      <input name="password" type="password" placeholder="Contraseña" required />
      <button type="submit">Registrar</button>
    </form>
    <a href="/">Volver al login</a>`);
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.send(`<p>Usuario ${username} registrado.</p><a href="/">Iniciar sesión</a>`);
  } catch (e) {
    res.send(`<p>Error: El usuario ya existe o hubo un problema.</p><a href="/register">Intentar de nuevo</a>`);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
  if (user) {
    // Renderizar página personalizada para el usuario
    res.render('chat', { username });
  } else {
    res.send(`<p>Login inválido.</p><a href="/">Volver</a>`);
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Error inicializando DB:', err);
  process.exit(1);
});
