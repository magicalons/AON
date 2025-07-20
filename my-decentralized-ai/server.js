const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { exec } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app); // Cambia a https si deseas
const io = new Server(server);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// OCR: llama script Python que devuelve JSON con texto
app.get('/ocr', (req, res) => {
  exec('python3 ocr/ocr.py', (err, stdout) => {
    if (err) return res.json({ text: '[Error OCR]' });
    res.json({ text: stdout.trim() });
  });
});

// IA local con llama.cpp o gpt4all vía script Python
app.post('/interpretar', (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ error: 'Prompt vacío' });

  const cmd = `python3 ocr/ocr_gpt_exec.py "${prompt.replace(/"/g, '\\"')}"`;

  exec(cmd, { timeout: 15000 }, (err, stdout) => {
    if (err) return res.json({ respuesta: '[Error IA]' });
    res.json({ respuesta: stdout.trim() });
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(\`Servidor corriendo en http://localhost:\${PORT}\`);
});
