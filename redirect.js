// redirect.js
const http = require('http');

http.createServer((req, res) => {
  const host = req.headers.host.replace(/:\d+$/, '');
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
}).listen(80, () => {
  console.log('🌐 Redireccionando HTTP → HTTPS en puerto 80');
});
