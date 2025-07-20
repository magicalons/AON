#!/bin/bash

# Ruta de la imagen OCR
IMAGE="/home/magic/aeon/ocr/input.png"

# Ruta del ejecutable llama-cli
LLAMA="/home/magic/aeon/models/llama.cpp/build/bin/llama-cli"

# Ruta del modelo
MODEL="/home/magic/aeon/models/mistral.gguf"

# Extraer texto con tesseract
PROMPT=$(tesseract "$IMAGE" stdout)

# Mostrar texto OCR
echo "OCR text:"
echo "$PROMPT"
echo "----------"

# Ejecutar llama-cli con prompt y generar 100 tokens
$LLAMA -m "$MODEL" -p "$PROMPT" -n 100
