from flask import Flask, jsonify, request
import os # Necesario para asegurar la ruta del archivo de log
from datetime import datetime # Para timestamp en el log

app = Flask(__name__)

# --- Configuración del archivo de log ---
# El log se guardará en el mismo directorio que el script
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'smdp_server.log')

def log_message(message):
    """Función auxiliar para escribir mensajes en un archivo de log."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, 'a') as f:
        f.write(f"[{timestamp}] {message}\n")
    print(f"[{timestamp}] {message}") # También lo imprime en la consola

# --- Base de datos de perfiles simulada ---
# En un entorno real, esto sería gestionado de forma segura y dinámica
# Aquí, un perfil de ejemplo para un EID (ID de eSIM) específico
simulated_profiles = {
    "8900000000000000001": { # Este es un EID de ejemplo, tu app Android lo enviaría
        "iccid": "8934010000000000001",
        "imsi": "001010000000001",
        "msisdn": "+34600123456",
        "profile_data": "base64_encoded_dummy_profile_data_for_test", # Dato ficticio
        "status": "active"
    }
}

# --- Endpoint de prueba básico (ruta raíz) ---
@app.route('/')
def home():
    log_message(f"Petición GET a la raíz desde: {request.remote_addr}")
    return "¡Servidor SM-DP+ simulado en funcionamiento!"

# --- Endpoint para obtener un 'challenge' ---
# Este es un paso inicial en el proceso de descarga de eSIM.
# En un SM-DP+ real, esto sería mucho más complejo y seguro.
@app.route('/smdp/v1/get_challenge', methods=['POST'])
def get_challenge():
    client_ip = request.remote_addr
    log_message(f"Petición de desafío recibida desde: {client_ip}. Datos: {request.json}")
    
    # Aquí podríamos validar algún encabezado o token en una versión más compleja
    
    response_data = {
        "transactionId": "simulated_txn_" + datetime.now().strftime("%f"), # ID de transacción único
        "challenge": "AABBCCDD11223344" # Un challenge de ejemplo
    }
    log_message(f"Respondiendo con desafío: {response_data['challenge']}")
    return jsonify(response_data)

# --- Endpoint para descargar un perfil ---
# Aquí la app cliente enviaría un EID y otros datos.
@app.route('/smdp/v1/download_profile', methods=['POST'])
def download_profile():
    client_ip = request.remote_addr
    data = request.json
    eid = data.get('eid') # La app cliente enviaría el EID
    transaction_id = data.get('transactionId') # La app cliente enviaría esto
    
    log_message(f"Petición de descarga de perfil recibida para EID: {eid} (Txn: {transaction_id}) desde: {client_ip}. Datos: {data}")

    profile_info = simulated_profiles.get(eid)

    if profile_info:
        log_message(f"Perfil encontrado para EID: {eid}. Entregando perfil.")
        return jsonify({
            "status": "success",
            "profile": profile_info
        })
    else:
        # Simulamos un error si el EID no se encuentra
        error_response = {
            "status": "error",
            "code": "PROFILE_NOT_FOUND",
            "message": f"No se encontró perfil para el EID: {eid}"
        }
        log_message(f"Error: Perfil no encontrado para EID: {eid}. Respondiendo con 404.")
        return jsonify(error_response), 404 # Código de estado HTTP 404 Not Found

if __name__ == '__main__':
    log_message("Iniciando servidor SM-DP+ simulado...")
    # 'host=0.0.0.0' permite que sea accesible desde otras máquinas en tu red.
    # 'port=5000' es el puerto por defecto de Flask.
    # 'debug=True' muestra errores detallados y recarga el servidor automáticamente.
    app.run(debug=True, host='0.0.0.0', port=5000)
