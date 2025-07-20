const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Secure Chat HTTPS OK');
});

https.createServer(options, app).listen(3443, () => {
  console.log('Servidor HTTPS corriendo en puerto 3443');
});
