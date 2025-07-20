#!/bin/bash

echo "=== Instalando y creando lo faltante para Proyecto Aeon ==="

# Detectar SO para instalar sqlite3 (solo para Linux Debian/Ubuntu y macOS)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  if ! command -v sqlite3 >/dev/null 2>&1; then
    echo "Instalando sqlite3 con apt-get..."
    sudo apt-get update && sudo apt-get install -y sqlite3
  else
    echo "sqlite3 ya instalado"
  fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
  if ! command -v sqlite3 >/dev/null 2>&1; then
    echo "Instalando sqlite3 con brew..."
    brew install sqlite3
  else
    echo "sqlite3 ya instalado"
  fi
else
  echo "Sistema operativo no reconocido para instalación automática de sqlite3."
fi

# Instalar paquetes Python si no están
install_python_pkg() {
  python3 -c "import $1" >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo "Instalando paquete Python $1..."
    python3 -m pip install --user "$1"
  else
    echo "Paquete Python $1 ya instalado"
  fi
}

install_python_pkg pytesseract
install_python_pkg openai

# Crear estructura básica de archivos/carpetas si no existen
[ -f app.js ] || cat > app.js << 'APPJS'
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hola, Secure Chat!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
APPJS

[ -d public ] || mkdir public

[ -f public/login.html ] || cat > public/login.html << 'LOGINHTML'
<!DOCTYPE html>
<html>
<head><title>Login Aeon</title></head>
<body>
<h2>Login Aeon</h2>
<form><input placeholder="Usuario"><br><input placeholder="Contraseña" type="password"><br><button>Entrar</button></form>
</body>
</html>
LOGINHTML

[ -f public/index.html ] || cat > public/index.html << 'INDEXHTML'
<!DOCTYPE html>
<html>
<head><title>Inicio Aeon</title></head>
<body>
<h1>Bienvenido a Aeon Secure Chat</h1>
</body>
</html>
INDEXHTML

[ -f public/chat.html ] || cat > public/chat.html << 'CHATHTML'
<!DOCTYPE html>
<html>
<head><title>Chat Aeon</title></head>
<body>
<h1>Chat grupal Aeon</h1>
</body>
</html>
CHATHTML

# Crear base de datos SQLite vacía si no existe
if [ ! -f users.db ]; then
  echo "Creando base de datos SQLite vacía 'users.db'..."
  sqlite3 users.db "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT);"
else
  echo "Base de datos 'users.db' ya existe"
fi

# Crear carpeta certs y generar certificados con mkcert
mkdir -p certs

if [ ! -f certs/localhost.pem ] || [ ! -f certs/localhost-key.pem ]; then
  echo "Generando certificados TLS para localhost con mkcert..."
  mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1 ::1
else
  echo "Certificados TLS para localhost ya existen"
fi

if [ ! -f certs/aeon.onion.pem ] || [ ! -f certs/aeon.onion-key.pem ]; then
  echo "Generando certificados TLS para aeon.onion con mkcert..."
  mkcert -cert-file certs/aeon.onion.pem -key-file certs/aeon.onion-key.pem aeon.onion
else
  echo "Certificados TLS para aeon.onion ya existen"
fi

# Crear carpeta llama y archivo marcador
mkdir -p llama
if [ ! -f llama/llama ]; then
  echo "Creando marcador de binario llama.cpp (archivo vacío llama/llama)"
  touch llama/llama
  chmod +x llama/llama
else
  echo "Binario llama.cpp (marcador) ya existe"
fi

echo "=== Instalación y creación finalizada ==="
