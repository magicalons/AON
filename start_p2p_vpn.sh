#!/bin/bash

set -e

echo "Creando interfaz tun0..."
sudo ip tuntap add dev tun0 mode tun || echo "tun0 ya existe"
sudo ip addr add 10.0.0.1/24 dev tun0 || echo "IP ya asignada"
sudo ip link set dev tun0 up

echo "Habilitando IP forwarding..."
sudo sysctl -w net.ipv4.ip_forward=1

echo "Configurando NAT con iptables..."
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

echo "Creando servidor Node.js HTTPS+WSS..."

cat > server.js << 'EOF'
import fs from 'fs';
import https from 'https';
import express from 'express';
import WebSocket from 'ws';

const app = express();

const options = {
  key: fs.readFileSync('./private.key'),
  cert: fs.readFileSync('./certificate.crt'),
};

const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', ws => {
  console.log('Cliente WSS conectado');

  ws.on('message', message => {
    console.log('Mensaje WSS:', message.toString());
  });

  ws.send('Bienvenido al nodo VPN P2P seguro');
});

server.listen(8443, () => {
  console.log('Servidor HTTPS+WSS escuchando en puerto 8443');
});
EOF

echo "Servidor creado. Iniciando servidor Node.js..."

nohup node server.js > server.log 2>&1 &

echo "Servidor iniciado en background con PID $!"
echo "Revisa logs con: tail -f server.log"

