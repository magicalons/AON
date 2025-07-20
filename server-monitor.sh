#!/usr/bin/env bash
LOGFILE="./server-monitor.log"
PIDFILE="./server-https.pid"
PORT=3443

# Mata procesos en el puerto $PORT
free_port() {
  echo "$(date) - Liberando puerto $PORT..." | tee -a "$LOGFILE"
  PIDS=$(lsof -ti tcp:$PORT)
  if [ -n "$PIDS" ]; then
    echo "$(date) - Encontrados procesos en puerto $PORT: $PIDS" | tee -a "$LOGFILE"
    kill $PIDS
    sleep 2
  else
    echo "$(date) - Puerto $PORT libre." | tee -a "$LOGFILE"
  fi
}

start_server() {
  free_port
  echo "$(date) - Iniciando servidor HTTPS..." | tee -a "$LOGFILE"
  node server-https.cjs &
  echo $! > "$PIDFILE"
  sleep 2
}

stop_server() {
  if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE")
    if kill -0 "$PID" 2>/dev/null; then
      echo "$(date) - Deteniendo servidor con PID $PID..." | tee -a "$LOGFILE"
      kill "$PID"
      sleep 2
    fi
    rm -f "$PIDFILE"
  fi
}

check_server() {
  if [ ! -f "$PIDFILE" ]; then
    echo "$(date) - No hay PID file, iniciando servidor..." | tee -a "$LOGFILE"
    start_server
    return
  fi

  PID=$(cat "$PIDFILE")
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "$(date) - Proceso $PID no está activo, reiniciando servidor..." | tee -a "$LOGFILE"
    start_server
  else
    echo "$(date) - Servidor activo con PID $PID." | tee -a "$LOGFILE"
  fi
}

# Detener servidor si está corriendo y liberar puerto
stop_server
free_port

# Iniciar servidor
start_server

# Loop para revisar cada 60 segundos
while true; do
  check_server
  sleep 60
done
