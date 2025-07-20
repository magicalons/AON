const socket = io();

const output = document.getElementById('output');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const ocrBtn = document.getElementById('ocr');
const iaBtn = document.getElementById('ia');

function appendMessage(from, text) {
  const msg = `[${from}] ${text}\n`;
  output.textContent += msg;
  output.scrollTop = output.scrollHeight;
}

sendBtn.addEventListener('click', () => {
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit('chat message', msg);
  appendMessage('Tú', msg);
  input.value = '';
});

socket.on('chat message', (msg) => {
  appendMessage('Otro', msg);
});

ocrBtn?.addEventListener('click', async () => {
  try {
    const response = await fetch('/ocr');
    const { text } = await response.json();
    input.value = text;
    appendMessage('OCR', text);
  } catch (e) {
    console.error('Error OCR:', e);
    appendMessage('OCR', 'Error al capturar texto');
  }
});

iaBtn?.addEventListener('click', async () => {
  const prompt = input.value.trim();
  if (!prompt) return;

  appendMessage('Tú (IA)', prompt);

  try {
    const response = await fetch('/interpretar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    appendMessage('IA', data.respuesta || '[sin respuesta]');
  } catch (e) {
    console.error('Error IA:', e);
    appendMessage('IA', 'Error al consultar IA local');
  }
});
