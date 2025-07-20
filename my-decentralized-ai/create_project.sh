#!/bin/bash
# Script para crear el proyecto de IA descentralizada

echo "Creando el proyecto..."

# Crea directorios
mkdir -p ~/aeon/my-decentralized-ai/{src,build,bin,config,docs}

# Inicializa el proyecto con CMake
cd ~/aeon/my-decentralized-ai
cmake .

# Compilación
make

# Preparar el entorno virtual
python3 -m venv venv
source venv/bin/activate

echo "El proyecto ha sido creado y configurado correctamente"

