#!/bin/bash

# Usage: ./build.sh <image-name> <context-dir> <dockerfile-path>
IMAGE_NAME="$1"
CONTEXT_DIR="$2"
DOCKERFILE_PATH="$3"

echo "🔧 Building Docker image '$IMAGE_NAME' using Dockerfile '$DOCKERFILE_PATH' from context '$CONTEXT_DIR'"
docker build -t "$IMAGE_NAME" -f "$DOCKERFILE_PATH" "$CONTEXT_DIR"

