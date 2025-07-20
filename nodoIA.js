// nodoIA.js
import WebSocket from 'ws';
import { spawn } from 'child_process';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('🤖 Nodo IA conectado al WebSocket');
});

ws.on('message', (data) => {
  const prompt = data.toString().trim();
  console.log(`📝 Pregunta recibida: ${prompt}`);

  // Ejecuta LLaMA con el prompt
  const llama = spawn('./main', [
    '-m', './models/llama-model.gguf',
    '-p', prompt,
    '--temp', '0.7',
    '--n-predict', '100',
  ]);

  let output = '';
  llama.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });

  llama.on('close', () => {
    const respuesta = output.trim();
    console.log(`💬 Respuesta IA: ${respuesta}`);
    ws.send(respuesta);
  });

  llama.on('error', (err) => {
    console.error('❌ Error ejecutando LLaMA:', err);
    ws.send('[Error al ejecutar modelo local]');
  });
});

