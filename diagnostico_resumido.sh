#!/bin/bash

echo -e "=== 🔧 DIAGNÓSTICO RESUMIDO DEL SISTEMA ==="

echo -e "\n🧠 Hostname: $(hostname)"
echo -e "📡 Interfaces activas: $(ip -o -4 addr show up | awk '{print $2": "$4}' | paste -sd ', ')"
echo -e "🔁 Ping localhost: $(ping -c1 127.0.0.1 >/dev/null && echo OK || echo FALLA)"
echo -e "🌍 Resolución de localhost: $(getent hosts localhost | awk '{print $1 " -> " $2}')"

echo -e "\n🧪 Servicios web detectados: $(ps aux | grep -E 'nginx|apache|node|python|php' | grep

