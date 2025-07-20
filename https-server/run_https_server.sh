#!/bin/bash
# Script para compilar y ejecutar mini_https_server en background

PORT=8443

echo "🛑 Matando proceso que use el puerto $PORT si existe..."
sudo kill $(sudo lsof -t -i :$PORT) 2>/dev/null

echo "🛠 Compilando mini_https_server.cpp..."
g++ mini_https_server.cpp -o mini_https_server -lssl -lcrypto

if [ $? -eq 0 ]; then
  echo "✅ Compilado correctamente."
  echo "🚀 Iniciando servidor en segundo plano..."
  sudo ./mini_https_server &
  sleep 1
  echo "Servidor HTTPS escuchando en puerto $PORT."
else
  echo "❌ Error en compilación. Revisa el código."
  exit 1
fi
