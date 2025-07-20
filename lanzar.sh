#!/bin/bash

PORT=12345
SOURCE="p2p_node.c"
OUTPUT="p2p_node"
MODO=${1:-server}  # Por defecto 'server'

echo "🔎 Buscando procesos en el puerto $PORT..."
PID=$(sudo lsof -t -i:$PORT || sudo netstat -tulnp 2>/dev/null | grep ":$PORT" | awk '{print $7}' | cut -d'/' -f1)

if [ ! -z "$PID" ]; then
    echo "⚠️ Puerto $PORT en uso por PID $PID. Terminando..."
    sudo kill -9 $PID
    sleep 1
    echo "✅ Proceso $PID eliminado."
else
    echo "✅ Puerto $PORT libre."
fi

# Compilar
echo "🔧 Compilando $SOURCE..."
gcc -o $OUTPUT $SOURCE

if [ $? -eq 0 ]; then
    echo "🚀 Ejecutando $OUTPUT en modo $MODO..."
    ./$OUTPUT $MODO
else
    echo "❌ Error al compilar $SOURCE"
fi
