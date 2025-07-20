import sys
import pytesseract
from PIL import Image

try:
    image_path = sys.argv[1]
except IndexError:
    print("ERROR: Falta argumento ruta de imagen")
    sys.exit(1)

try:
    img = Image.open(image_path)
    print(f"Imagen abierta: {image_path}, tamaño: {img.size}, modo: {img.mode}")
except Exception as e:
    print("ERROR al abrir imagen:", e)
    sys.exit(1)

try:
    text = pytesseract.image_to_string(img)
    print("Texto OCR extraído:")
    print(text.strip())
except Exception as e:
    print("ERROR en OCR:", e)
    sys.exit(1)

