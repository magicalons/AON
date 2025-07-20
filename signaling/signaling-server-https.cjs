const fs = require('fs');
const https = require('https');
const express = require('express');
const { Server: IOServer } = require('socket.io');

const app = express();
const PORT = 443;

// HTTPS credentials
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// HTTPS server
const server = https.createServer(options, app);

// Socket.io sobre HTTPS
const io = new IOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Rutas básicas
app.get('/', (req, res) => {
  res.send('Servidor de señalización Aeon corriendo con HTTPS ✅');
});

// Lógica de señalización WebRTC
io.on('connection', (socket) => {
  console.log('Conectado:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('new-peer', socket.id);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('peer-disconnected', socket.id);
    });
  });

  socket.on('offer', ({ to, offer, from }) => {
    io.to(to).emit('offer', { from, offer });
  });

  socket.on('answer', ({ to, answer, from }) => {
    io.to(to).emit('answer', { from, answer });
  });

  socket.on('ice-candidate', ({ to, candidate, from }) => {
    io.to(to).emit('ice-candidate', { from, candidate });
  });
});

// Arrancar servidor
server.listen(PORT, () => {
  console.log(`✅ Servidor HTTPS escuchando en puerto ${PORT}`);
});
