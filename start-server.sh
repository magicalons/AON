#!/bin/bash

PORT=8443
PID=$(lsof -t -i :$PORT)

if [ -n "$PID" ]; then
  echo "El puerto $PORT está ocupado por el proceso con PID $PID. Matando el proceso..."
  kill -9 $PID
else
  echo "El puerto $PORT está libre."
fi

node /home/magic/aeon/server.cjs
