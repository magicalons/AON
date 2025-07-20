#!/bin/bash

PORT=4433
LOGFILE="/home/magic/aeon/start-server.log"

echo "---- Diagnóstico del servidor Aeon ----"
echo "Fecha y hora: $(date)"
echo ""

echo "1) Procesos escuchando en el puerto $PORT:"
sudo lsof -i TCP:$PORT || echo "No se encontró proceso en puerto $PORT"
echo ""

echo "2) Estado del firewall (ufw):"
sudo ufw status verbose
echo ""

echo "3) Reglas iptables para el puerto $PORT:"
sudo iptables -L INPUT -v -n | grep $PORT || echo "No hay reglas específicas para puerto $PORT"
echo ""

echo "4) Contenido del log de arranque (últimas 20 líneas):"
tail -n 20 "$LOGFILE" || echo "No se pudo leer el log en $LOGFILE"
echo ""

echo "5) Verificación de interfaces y puertos escuchando:"
sudo netstat -tulnp | grep $PORT || echo "No se encontraron conexiones en puerto $PORT"
echo ""

echo "6) Resultado de curl local (ignora certificado):"
curl -k https://localhost:$PORT || echo "No se pudo conectar a https://localhost:$PORT"
