import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';

const privateKey = fs.readFileSync('./certs/private.key', 'utf8');
const certificate = fs.readFileSync('./certs/certificate.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate };

const app = express();
const PORT = 3443;

app.use(express.static(path.resolve('./frontend')));

const httpsServer = https.createServer(credentials, app);

const wss = new WebSocketServer({ server: httpsServer, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Cliente WSS conectado');

  ws.on('message', (message) => {
    console.log('Mensaje recibido:', message.toString());
    ws.send(`Respuesta segura: ${message.toString()}`);
  });

  ws.on('close', () => {
    console.log('Cliente WSS desconectado');
  });
});

httpsServer.listen(PORT, () => {
  console.log(`Servidor HTTPS + WSS escuchando en https://localhost:${PORT}`);
});
