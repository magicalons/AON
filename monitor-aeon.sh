#!/bin/bash

SERVICE="aeon-server.service"
MAX_RETRIES=3
RETRY_INTERVAL=60   # segundos
COUNTER_FILE="/home/magic/aeon/aeon-restart-counter.txt"

# Inicializa contador si no existe
if [ ! -f "$COUNTER_FILE" ]; then
  echo 0 > "$COUNTER_FILE"
fi

# Función para enviar notificación simple
notify() {
  echo "[$(date)] ALERTA: $1"
}

# Revisa estado del servicio
STATUS=$(systemctl is-active $SERVICE)

if [ "$STATUS" != "active" ]; then
  RETRIES=$(cat $COUNTER_FILE)
  RETRIES=$((RETRIES + 1))
  echo $RETRIES > $COUNTER_FILE

  if [ "$RETRIES" -le "$MAX_RETRIES" ]; then
    notify "Servicio $SERVICE no está activo. Intentando reiniciar (intento $RETRIES)..."
    systemctl restart $SERVICE
  else
    notify "Servicio $SERVICE falló $RETRIES veces seguidas. No se intentará reiniciar más."
    # Aquí puedes añadir envío de email o alertas más avanzadas
  fi
else
  # Si está activo, resetea contador
  echo 0 > $COUNTER_FILE
fi

