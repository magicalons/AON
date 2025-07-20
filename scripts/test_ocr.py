#!/usr/bin/env python3
import pytesseract
from PIL import Image
import subprocess

# Ruta de la imagen
image_path = "screenshot.png"

# 1. Tomar captura de pantalla
print("Tomando captura de pantalla...")
subprocess.run("scrot screenshot.png", shell=True, check=True)
print(f"Captura guardada en {image_path}")

# 2. Abrir la imagen
print("Abriendo imagen para OCR...")
img = Image.open(image_path)

# 3. Procesar con OCR
print("Procesando OCR...")
extracted_text = pytesseract.image_to_string(img)

# 4. Mostrar resultado
print("Texto detectado por OCR:")
print(repr(extracted_text))
