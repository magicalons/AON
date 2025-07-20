import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Cliente conectado al servidor WebSocket');

  ws.on('message', (message) => {
    console.log('Mensaje recibido del cliente:', message);
    // Echo de vuelta al cliente
    ws.send(message);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

console.log('Servidor WebSocket escuchando en ws://localhost:8080');
