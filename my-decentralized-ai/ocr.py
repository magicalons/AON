import pytesseract
from PIL import Image
import sys

def ocr_image(image_path):
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img)
    return text

if __name__ == "__main__":
    image_path = sys.argv[1]
    print(ocr_image(image_path))  # Imprimir el texto extraído
