import { Tun } from 'tuntap2';

async function testTun() {
  try {
    const tun = new Tun({ type: 'tun', name: 'tun0' });

    tun.on('data', (data) => {
      console.log('Datos recibidos en tun:', data);
    });

    tun.on('error', (err) => {
      console.error('Error en tun:', err);
    });

    console.log('Dispositivo TUN abierto.');
  } catch (err) {
    console.error('Error al abrir tun:', err);
  }
}

testTun();
