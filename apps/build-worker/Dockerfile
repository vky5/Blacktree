# ------------------------------
# Stage 1: Build Go Worker Binary
# ------------------------------
FROM golang:1.24-alpine AS builder

WORKDIR /app/worker

# Copy Go modules
COPY build-worker/go.mod build-worker/go.sum ./
COPY shared/go.mod shared/go.sum ../shared/

# Download dependencies
RUN go mod download

# Copy source code
COPY build-worker/ ./
COPY shared/ ../shared/

# Build the worker binary
RUN go build -o /app/worker/worker ./cmd

# ------------------------------
# Stage 2: Final Image
# ------------------------------
FROM golang:1.24-alpine

# Install Docker CLI + BuildKit plugin + git + bash
RUN apk add --no-cache docker-cli docker-cli-buildx git bash

# Copy worker binary
COPY --from=builder /app/worker/worker /worker

# Copy scripts
COPY build-worker/scripts/ /app/scripts/
RUN chmod +x /app/scripts/build.sh

WORKDIR /app
EXPOSE 6000

CMD ["/worker"]
