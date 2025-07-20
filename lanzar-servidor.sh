#!/bin/bash

# Configuración
AEON_DIR="$HOME/aeon"
CERT_DIR="$AEON_DIR/certs"
PUBLIC_DIR="$AEON_DIR/public"
PORT=4433
SERVER="$AEON_DIR/server.cjs"

echo "==> 1) Creando carpetas si no existen..."
mkdir -p "$CERT_DIR" "$PUBLIC_DIR"

echo "==> 2) Verificando certificados en $CERT_DIR"
if [[ ! -f "$CERT_DIR/server.key" || ! -f "$CERT_DIR/server.crt" ]]; then
  echo "❌ Certificados no encontrados en $CERT_DIR. Asegúrate de que existen."
  exit 1
else
  echo "✅ Certificados encontrados."
fi

echo "==> 3) Permitiendo puerto $PORT en ufw (firewall)..."
sudo ufw allow $PORT

echo "==> 4) Lanzando servidor Node.js..."
node "$SERVER" &

SERVER_PID=$!
echo "✅ Servidor arrancado con PID $SERVER_PID. Esperando 3 segundos..."
sleep 3

echo "==> 5) Verificando conexión local..."
curl -k https://localhost:$PORT && echo "✅ Conexión OK" || echo "❌ No se pudo conectar"

echo "==> 6) Verificando proceso en puerto $PORT:"
sudo lsof -iTCP:$PORT -sTCP:LISTEN

echo "==> Para detener el servidor: kill $SERVER_PID"
