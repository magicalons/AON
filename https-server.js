import https from 'https';
import fs from 'fs';
import express from 'express';
import path from 'path';

const app = express();

const options = {
  key: fs.readFileSync('/home/magic/aeon/certs/localhost+2-key.pem'),
  cert: fs.readFileSync('/home/magic/aeon/certs/localhost+2.pem')
};

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(process.cwd(), 'public')));

https.createServer(options, app).listen(8443, () => {
  console.log('Servidor HTTPS escuchando en puerto 8443');
});


