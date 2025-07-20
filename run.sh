#!/bin/bash

# Ruta base del proyecto
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Ruta al entorno virtual
VENV="$PROJECT_DIR/venv"

# Si no existe el entorno virtual, lo creamos
if [ ! -d "$VENV" ]; then
  echo "🔧 Creando entorno virtual..."
  python3 -m venv "$VENV"
  source "$VENV/bin/activate"
  pip install --upgrade pip
  pip install psutil
else
  echo "✅ Entorno virtual encontrado"
  source "$VENV/bin/activate"
fi

# Ejecutamos el script principal
echo "🚀 Ejecutando IA desde main.py..."
python "$PROJECT_DIR/main.py"

