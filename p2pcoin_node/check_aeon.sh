#!/bin/bash

echo "=== Comprobando dependencias y archivos del Proyecto Aeon ==="

check_command() {
  command -v "$1" >/dev/null 2>&1 && echo "✓ $1 instalado" || echo "✗ $1 NO encontrado"
}

check_python_package() {
  python3 -c "import $1" >/dev/null 2>&1 && echo "✓ Python package '$1' instalado" || echo "✗ Python package '$1' NO instalado"
}

check_file() {
  [ -f "$1" ] && echo "✓ Archivo '$1' encontrado" || echo "✗ Archivo '$1' NO encontrado"
}

check_dir() {
  [ -d "$1" ] && echo "✓ Carpeta '$1' encontrada" || echo "✗ Carpeta '$1' NO encontrada"
}

echo -e "\n-- Comprobando comandos del sistema --"
check_command node
check_command npm
check_command python3
check_command pip
check_command tesseract
check_command ffmpeg
check_command sqlite3
check_command openssl
check_command mkcert

echo -e "\n-- Comprobando paquetes Python --"
check_python_package pytesseract
check_python_package openai

echo -e "\n-- Comprobando archivos y carpetas clave --"
check_file app.js
check_file server.js
check_dir public
check_file public/login.html
check_file public/index.html
check_file public/chat.html
check_file users.db

echo -e "\n-- Comprobando certificados TLS --"
check_file certs/localhost.pem
check_file certs/localhost-key.pem
check_file certs/aeon.onion.pem
check_file certs/aeon.onion-key.pem

echo -e "\n-- Comprobando binarios llama.cpp (ruta típica './llama') --"
[ -f "./llama/llama" ] && echo "✓ Binario llama.cpp encontrado en ./llama/llama" || echo "✗ Binario llama.cpp NO encontrado en ./llama/llama"

echo -e "\nComprobación completa."
