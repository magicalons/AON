import pytesseract
from PIL import Image
import openai
import subprocess
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

imagen = "captura.png"

try:
    texto = pytesseract.image_to_string(Image.open(imagen))
    print("[🧠 OCR Detectado]:\n", texto)
except Exception as e:
    print(f"❌ Error leyendo imagen: {e}")
    exit()

mensaje = f"""
Este es el texto leído desde la pantalla del sistema:

\"\"\"
{texto}
\"\"\"

Dime qué comando debería ejecutar para responder o automatizar esta situación. Solo responde con el comando exacto a ejecutar en bash.
"""

try:
    respuesta = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Eres un agente que interpreta texto de pantalla y devuelve comandos shell."},
            {"role": "user", "content": mensaje}
        ]
    )
    comando = respuesta['choices'][0]['message']['content'].strip()
    print(f"\n[🤖 GPT sugiere ejecutar]: {comando}")
    subprocess.run(comando, shell=True, check=True)
except Exception as e:
    print(f"❌ Error con GPT o ejecución: {e}")
