#!/bin/bash

# Usage: ./run.sh <image-name> <container-name> <container-port> <host-port>

IMAGE_NAME="$1"
CONTAINER_NAME="$2"
CONTAINER_PORT="$3"
HOST_PORT="$4"

echo "🚀 Running Docker container '$CONTAINER_NAME' from image '$IMAGE_NAME'"
echo "🔁 Mapping container port $CONTAINER_PORT to host port $HOST_PORT"

docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$HOST_PORT:$CONTAINER_PORT" \
  "$IMAGE_NAME"
