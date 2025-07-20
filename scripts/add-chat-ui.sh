#!/bin/bash

HTML_FILE=~/aeon/frontend/index.html

if [[ ! -f "$HTML_FILE" ]]; then
  echo "❌ No se encontró $HTML_FILE"
  exit 1
fi

# Añadir UI del chat (textarea + input)
sed -i '/<\/div>/ a \
<div>\
  <textarea id="chat" cols="60" rows="5" readonly placeholder="Chat aquí..."></textarea><br>\
  <input id="msg" placeholder="Mensaje...">\
  <button onclick="sendMsg()">Enviar</button>\
</div>' "$HTML_FILE"

# Reemplazar el bloque <script> con uno nuevo completo
cat << 'EOF' >> "$HTML_FILE"
<script>
const socket = io('https://'+location.hostname, { path: '/socket.io' });
let localStream, peerConnection, remoteSocketId, dataChannel;

const startCall = async () => {
  const roomId = document.getElementById("room").value;
  if (!roomId) return alert("Ingresa un nombre de sala");

  socket.emit("join-room", roomId);

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  document.getElementById("local").srcObject = localStream;

  peerConnection = new RTCPeerConnection();

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) {
      socket.emit("ice-candidate", { to: remoteSocketId, candidate });
    }
  };

  peerConnection.ontrack = ({ streams: [stream] }) => {
    document.getElementById("remote").srcObject = stream;
  };

  socket.on("new-peer", async (id) => {
    remoteSocketId = id;
    dataChannel = peerConnection.createDataChannel("chat");
    setupDataChannel();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { to: id, offer, from: socket.id });
  });

  socket.on("offer", async ({ from, offer }) => {
    remoteSocketId = from;
    peerConnection.ondatachannel = (event) => {
      dataChannel = event.channel;
      setupDataChannel();
    };
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", { to: from, answer, from: socket.id });
  });

  socket.on("answer", async ({ answer }) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    if (candidate) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error ICE", err);
      }
    }
  });
};

function setupDataChannel() {
  dataChannel.onmessage = (event) => {
    document.getElementById("chat").value += "\nEllx: " + event.data;
  };
}

function sendMsg() {
  const msg = document.getElementById("msg").value;
  document.getElementById("chat").value += "\nYo: " + msg;
  dataChannel.send(msg);
  document.getElementById("msg").value = "";
}
</script>
EOF

echo "✅ Chat textual inyectado en $HTML_FILE"
