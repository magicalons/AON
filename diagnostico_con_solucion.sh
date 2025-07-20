#!/bin/bash

echo -e "=== 🔧 DIAGNÓSTICO COMPLETO DEL SISTEMA ==="

echo -e "\n🧠 Hostname: $(hostname)"
echo -e "📡 Interfaces activas:"
ip -o -4 addr show up | awk '{print $2 ": " $4}' || echo "❌ Sin interfaces activas"

echo -e "🌍 Resolución de localhost:"
grep localhost /etc/hosts || echo "❌ Entrada localhost no encontrada en /etc/hosts"

echo -e "🔁 Ping a localhost: $(ping -c1 127.0.0.1 &>/dev/null && echo OK || echo FALLA)"
echo -e "🌐 Ping a Internet (google.com): $(ping -c1 google.com &>/dev/null && echo OK || echo SIN ACCESO)"

echo -e "\n🧪 Servicios web detectados (Node/Apache/Nginx/PHP):"
ps aux | grep -E 'node|apache|nginx|php' | grep -v grep || echo "❌ Ninguno activo"

echo -e "🧭 Puertos web en escucha (80/443 y alternativos):"
ss -tuln | grep -E ':80|:443|:3000|:5000|:8080' || echo "❌ Ningún servicio en puertos comunes web"

echo -e "\n📦 Node.js:"
NODE_PATH=$(which node)
if [[ -z "$NODE_PATH" ]]; then
  echo "❌ Node.js no instalado o no disponible"
else
  echo "$NODE_PATH"
  node -v
fi

echo -e "\n🛡 Reglas activas del firewall:"
echo "- iptables: $(sudo iptables -L -n | grep -c 'Chain') cadenas"
echo "- nftables: $(sudo nft list ruleset | grep -c 'table') tablas"

echo -e "\n🔎 Servicios activos: $(systemctl list-units --type=service --state=running | wc -l)"
echo -e "🔥 Últimos errores críticos:"
journalctl -p 3 -xb | tail -n 3

echo -e "\n📜 Últimos errores relacionados con Node.js o Express:"
journalctl -xe | grep -iE 'node|express|error' | tail -n 5 || echo "Sin errores recientes"

# Diagnóstico especial para problema de node en systemd
echo -e "\n🔍 Diagnóstico systemd para servicio qr-server.service:"
SERVICE_FILE=$(systemctl show -p FragmentPath qr-server.service | cut -d= -f2)
if [[ ! -f "$SERVICE_FILE" ]]; then
  echo "❌ Servicio qr-server.service no encontrado."
else
  echo "Archivo servicio: $SERVICE_FILE"
  EXEC_START=$(grep -Po '(?<=^ExecStart=).*' "$SERVICE_FILE")
  echo "ExecStart actual: $EXEC_START"
  NODE_PATH_ACTUAL=$(echo "$EXEC_START" | awk '{print $1}')
  echo "Ruta de node usada: $NODE_PATH_ACTUAL"

  if [[ ! -x "$NODE_PATH_ACTUAL" ]]; then
    echo "❌ Ruta $NODE_PATH_ACTUAL no existe o no es ejecutable."

    echo -e "\n➡️ Opciones para arreglar esto:"

    # Buscar node en sistema (especialmente NVM)
    NVM_NODE=$(command -v node)
    echo "Ruta node detectada en sistema: $NVM_NODE"

    echo -e "\n1) Cambiar ruta ExecStart en el servicio para usar esta ruta:\n"
    echo "sudo nano $SERVICE_FILE"
    echo "Cambiar ExecStart a:"
    echo "  $NVM_NODE <resto del comando>"
    echo -e "\nLuego recargar y reiniciar:\n"
    echo "sudo systemctl daemon-reload"
    echo "sudo systemctl restart qr-server.service"
    echo "sudo systemctl status qr-server.service"

    echo -e "\n2) O crear enlace simbólico para node:\n"
    echo "sudo ln -s $NVM_NODE /usr/bin/node"

  else
    echo "✅ La ruta ExecStart apunta a un node ejecutable."
  fi
fi

echo -e "\n✅ Diagnóstico completo generado."
