#!/bin/bash
# Script para activar entorno virtual y ejecutar ocr.py

cd /home/magic/aeon || exit 1
source ./venv/bin/activate
python ocr.py "$@"
