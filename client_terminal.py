#!/usr/bin/env python3
import sys
import urllib.parse
import urllib.request
import ssl
import json

API_URL = "https://localhost:4443/model"
API_KEY = "mi_super_clave"

def preguntar(prompt):
    params = urllib.parse.urlencode({"prompt": prompt, "key": API_KEY})
    url = f"{API_URL}?{params}"

    # Contexto SSL que no verifica certificado (auto-firmado)
    context = ssl._create_unverified_context()

    try:
        with urllib.request.urlopen(url, context=context) as response:
            data = response.read()
            decoded = data.decode()
            json_data = json.loads(decoded)
            print("Respuesta IA:", json_data.get("response", "No hay respuesta"))
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Uso: {sys.argv[0]} 'tu pregunta aquí'")
        sys.exit(1)

    prompt = sys.argv[1]
    preguntar(prompt)
