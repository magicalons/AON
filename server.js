const express = require('express'), https = require('https'), fs = require('fs'), path = require('path'), { exec } = require('child_process');
const app = express(), API_TOKEN = 'mi-token-secreto';
app.use(express.static('public'));
app.use('/models', (req, res, next) => {
  const t = req.headers['authorization']?.split(' ')[1];
  if (t !== API_TOKEN) return res.status(401).json({ error:'⛔ Token inválido' });
  next();
});
app.get('/models/:f', (req,res) => {
  const p = path.join(__dirname,'models',req.params.f);
  if (!fs.existsSync(p)) return res.status(404).json({error:'❌ Modelo no encontrado'});
  res.sendFile(p);
});
const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
}, app);
server.listen(3443, () => console.log('✅ HTTPS server en https://localhost:3443'));

const io = require('socket.io')(server);
io.on('connection', s => {
  s.on('mensajeCliente', msg => {
    if (!msg.startsWith('/ai ')) return s.emit('mensajeServidor','🧑 Usuario: '+msg);
    const p = msg.slice(4).replace(/"/g,'');
    exec(`./llama.cpp/build/bin/llama-run -m ./models/tinyllama.gguf -p "${p}"`, (err, out, errt) => {
      if (err) { console.error(err,errt); return s.emit('mensajeServidor','⚠️ Error IA'); }
      s.emit('mensajeServidor','🤖 Aeon:\\n'+out);
    });
  });
});
