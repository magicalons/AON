import { Tun } from 'tuntap2';

async function main() {
  try {
    // Crear interfaz tun llamada tun0
    const tun = new Tun({ type: 'tun', name: 'tun0' });
    console.log('Interfaz TUN abierta:', tun.name);

    // Escuchar datos entrantes
    tun.on('data', (data) => {
      console.log('Paquete recibido:', data.toString('hex'));

      // Ejemplo: responder escribiendo el mismo paquete (eco)
      tun.write(data).catch(err => {
        console.error('Error al escribir paquete:', err);
      });
    });

    tun.on('error', (err) => {
      console.error('Error en tun:', err);
    });
  } catch (err) {
    console.error('Error al crear TUN:', err);
  }
}

main();
