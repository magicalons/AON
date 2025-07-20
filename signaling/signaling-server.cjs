const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server: IOServer } = require('socket.io');

const PORT = 443;

const io = new IOServer(server, {
  cors: { origin: '*', methods: ['GET','POST'] } // ajusta ORIGIN en producción
});

io.on('connection', (socket) => {
  console.log('Socket conectado:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} se une a sala ${roomId}`);
    socket.to(roomId).emit('new-peer', socket.id);

    socket.on('disconnect', () => {
      console.log(`${socket.id} se desconectó de sala ${roomId}`);
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

server.listen(PORT, () => {
  console.log(`Signaling server escuchando en puerto ${PORT}`);
});
