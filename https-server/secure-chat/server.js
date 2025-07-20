import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';

const app = express();

const credentials = {
  key: fs.readFileSync(path.resolve('./cert/key.pem')),
  cert: fs.readFileSync(path.resolve('./cert/cert.pem'))
};

app.get('/', (req, res) => {
  res.send('Hola, Secure Chat!');
});

const PORT = 3000;
https.createServer(credentials, app).listen(PORT, () => {
  console.log(`Servidor HTTPS escuchando en https://localhost:${PORT}`);
});
