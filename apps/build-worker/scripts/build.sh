#!/bin/bash

# Exit on any failure
set -e

# Input args
IMAGE_NAME=$1        
CONTEXT_DIR=$2       
DOCKERFILE_PATH=$3   
FOLDER_NAME=$4

# Validate input
if [ -z "$IMAGE_NAME" ] || [ -z "$CONTEXT_DIR" ] || [ -z "$DOCKERFILE_PATH"|| -z "$FOLDER_NAME" ]; then
  echo "❌ Missing arguments."
  echo "Usage: ./scripts/build.sh <image-name> <context-dir> <dockerfile-path> <folder-name>"
  exit 1
fi

# Export BuildKit env var
export DOCKER_BUILDKIT=1 # this env variable tells the docker CLI to use the buildkit backend instead of legacy builder

# CD to that directory
cd "FOLDER_NAME"

# Run the build
docker build \
  -t "$IMAGE_NAME" \
  -f "$DOCKERFILE_PATH" \
  "$CONTEXT_DIR"

echo "✅ Image built: $IMAGE_NAME"
