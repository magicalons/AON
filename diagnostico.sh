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
which node && node -v || echo "❌ Node.js no instalado o no disponible"

echo -e "\n🛡 Reglas activas del firewall:"
echo "- iptables: $(sudo iptables -L -n | grep -c 'Chain') cadenas"
echo "- nftables: $(sudo nft list ruleset | grep -c 'table') tablas"

echo -e "\n🔎 Servicios activos: $(systemctl list-units --type=service --state=running | wc -l)"
echo -e "🔥 Últimos errores críticos:"
journalctl -p 3 -xb | tail -n 3

echo -e "\n📜 Últimos errores relacionados con Node.js o Express:"
journalctl -xe | grep -iE 'node|express|error' | tail -n 5 || echo "Sin errores recientes"

echo -e "\n✅ Diagnóstico completo en: salida_diagnostico_completo.txt"
