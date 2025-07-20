const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();

const ssl = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
};

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

function startServer(port, fallback) {
  const server = https.createServer(ssl, app);
  server.listen(port)
    .on('listening', () => console.log('HTTPS listening on port ' + port))
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' && fallback) {
        console.warn('Port ' + port + ' in use, trying ' + fallback + '...');
        startServer(fallback, null);
      } else {
        console.error('Error starting server:', err);
        process.exit(1);
      }
    });
}

startServer(443, 8443);

process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});
