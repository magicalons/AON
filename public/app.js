const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
  secret: 'mi_secreto_ultra_seguro',
  resave: false,
  saveUninitialized: false
}));

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs');

// Usuarios "falsos" para ejemplo
const users = {
  juan: { username: 'juan', password: '1234', name: 'Juan Pérez', messages: ['Hola!', '¿Cómo estás?'] },
  maria: { username: 'maria', password: '4321', name: 'María López', messages: ['Buenas tardes', '¿Listo para la reunión?'] }
};

// Ruta Login (GET)
app.get('/', (req, res) => {
  if (req.session.user) {
    // Si ya está logueado, redirigir al chat
    return res.redirect('/chat');
  }
  res.render('index', { error: null });
});

// Ruta Login (POST)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  
  if (user && user.password === password) {
    req.session.user = user;
    return res.redirect('/chat');
  } else {
    res.render('index', { error: 'Usuario o contraseña incorrectos' });
  }
});

// Ruta Chat - página principal para usuario logueado
app.get('/chat', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.render('chat', { user: req.session.user });
});

// Ruta Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static('public'));

const PORT = 443;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
