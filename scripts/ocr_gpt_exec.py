#!/usr/bin/env python3
import pytesseract
from PIL import Image
import subprocess
import openai
import datetime
import os

# --- CONFIG ---
openai.api_key = "TBTlVlHHg5pOOAQRdyRi3FWMLXs5uHK5VH2hzNHZ0nrGdf9I8RExn2VJxiVdzh7wcFslRVcLD2T3BlbkFJHWwzUzzVlXLtHwIq1C46fm9cboGdIA2jS5R-_3n7cFuRU76INDrdwk4oSnOBhXViRZtnCNh-gA"
image_path = "screenshot.png"
log_path = os.path.expanduser("~/aeon/logs/ocr_exec.log")
os.makedirs(os.path.dirname(log_path), exist_ok=True)

def log(msg_type, msg):
    with open(log_path, "a") as log:
        log.write(f"[{msg_type}] {datetime.datetime.now()}: {msg}\n")

try:
    print("Tomando captura de pantalla...")
    subprocess.run("scrot screenshot.png", shell=True, check=True)
    print(f"Captura guardada en {image_path}")

    print("Abriendo imagen para OCR...")
    image = Image.open(image_path)

    print("Procesando OCR...")
    extracted_text = pytesseract.image_to_string(image)
    print(f"Texto detectado:\n{extracted_text}")
    log("INFO", f"Texto detectado:\n{extracted_text}")

    print("Consultando API de OpenAI...")
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=extracted_text,
        max_tokens=150
    )
    answer = response.choices[0].text.strip()
    print(f"Respuesta GPT:\n{answer}")
    log("INFO", f"Respuesta GPT:\n{answer}")

except Exception as e:
    print(f"Error: {e}")
    log("ERROR", str(e))

