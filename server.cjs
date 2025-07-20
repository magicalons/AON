const https = require('https');
const fs = require('fs');
const express = require('express');
const { exec } = require('child_process');
const { Server } = require('socket.io');

const app = express();
const server = https.createServer({
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
}, app);

const io = new Server(server);
app.use(express.static('public'));

io.on('connection', socket => {
  console.log('🟢 Usuario conectado');

  socket.on('mensajeCliente', msg => {
    console.log('💬 Usuario:', msg);

    if (msg.startsWith('/ai')) {
      const prompt = msg.replace('/ai', '').trim();
      exec(`./llama.cpp/main -m ./llama.cpp/models/tinyllama.gguf -p "${prompt}"`, (err, stdout, stderr) => {
        if (err) return socket.emit('mensajeServidor', '⚠️ Error al ejecutar IA');
        socket.emit('mensajeServidor', `🤖 Aeon:\n${stdout}`);
      });
    } else {
      socket.emit('mensajeServidor', `🧑 Usuario:\n${msg}`);
    }
  });
});

server.listen(3443, () => console.log('✅ Aeon activo en https://localhost:3443'));
