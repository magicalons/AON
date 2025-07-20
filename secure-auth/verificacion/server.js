const express = require('express');
const path = require('path');

const app = express();

const PUERTO = 8443; // Cambia el puerto si quieres

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      console.error('Error al enviar index.html:', err);
      res.status(500).send('Error interno del servidor');
    }
  });
});

app.listen(PUERTO, () => {
  console.log(`Servidor activo en http://localhost:${PUERTO}`);
});
