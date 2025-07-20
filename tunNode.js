import { Tun } from 'tuntap2';
import WebSocket from 'ws';

async function startNode() {
  // Crear tun0
  const tun = new Tun({ type: 'tun', name: 'tun0' });
  console.log('Interfaz TUN abierta:', tun.name);

  // Abrir WebSocket cliente o servidor (según arquitectura)
  const ws = new WebSocket('ws://localhost:8080'); // Cambia a tu nodo o servidor

  ws.on('open', () => {
    console.log('WebSocket conectado');
  });

  ws.on('message', (message) => {
    // Recibimos paquete IP desde la red P2P, lo escribimos en TUN
    const packet = Buffer.from(message);
    tun.write(packet).catch(console.error);
  });

  tun.on('data', (data) => {
    // Cuando la interfaz TUN recibe datos, los enviamos al canal P2P (WebSocket)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket cerrado');
  });

  ws.on('error', (err) => {
    console.error('Error WebSocket:', err);
  });

  tun.on('error', (err) => {
    console.error('Error TUN:', err);
  });
}

startNode().catch(console.error);
