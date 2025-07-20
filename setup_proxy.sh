#!/bin/bash

CERT_PATH="/home/magic/aeon/cert/cert.pem"
KEY_PATH="/home/magic/aeon/cert/key.pem"

echo "🔧 Terminando procesos en puerto 443..."
sudo fuser -k 443/tcp

echo "📝 Corrigiendo configuración de Nginx..."
cat <<EOF | sudo tee /etc/nginx/sites-available/aeon > /dev/null
server {
    listen 443 ssl;
    server_name _;

    ssl_certificate     $CERT_PATH;
    ssl_certificate_key $KEY_PATH;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo "🔗 Habilitando sitio en Nginx..."
sudo ln -sf /etc/nginx/sites-available/aeon /etc/nginx/sites-enabled/aeon

echo "✅ Verificando y recargando Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✏️ Corrigiendo signaling-server.cjs para usar puerto 3000..."
sed -i 's/server\.listen\s*(443)/server.listen(3000)/' ~/aeon/signaling/signaling-server.cjs

echo "🚀 Lanzando signaling-server en puerto 3000..."
node ~/aeon/signaling/signaling-server.cjs
