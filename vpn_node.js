import fs from 'fs';
import net from 'net';
import { WebSocket } from 'ws';

// Ruta al dispositivo TUN en Linux
const TUN_PATH = '/dev/net/tun';

// Abrimos el tun como un archivo
const tun = fs.openSync(TUN_PATH, 'r+');

// Configurar WebSocket hacia otro nodo
const peer = new WebSocket('wss://localhost:8443/ws', {
  rejectUnauthorized: false // permite certificado autofirmado
});

peer.on('open', () => {
  console.log('[+] Conectado al nodo remoto vía WSS');
});

peer.on('message', (data) => {
  // Escribir paquete recibido en la interfaz tun0
  fs.writeSync(tun, data);
  console.log('[<] Paquete recibido del nodo remoto');
});

// Leer desde tun y enviar por WebSocket
function readLoop() {
  const buffer = Buffer.alloc(1500);
  fs.read(tun, buffer, 0, buffer.length, null, (err, bytesRead) => {
    if (err) return console.error('Error leyendo tun:', err);
    const packet = buffer.slice(0, bytesRead);
    if (peer.readyState === WebSocket.OPEN) {
      peer.send(packet);
      console.log('[>] Paquete enviado al nodo remoto');
    }
    setImmediate(readLoop);
  });
}

readLoop();
