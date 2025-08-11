
# Builder image
FROM golang:1.24-alpine AS builder

WORKDIR /app/worker

# Copy go.mod and go.sum of orchestrator (which includes shared module as a dependency)
COPY build-worker/go.mod build-worker/go.sum ./

# Copy shared module's go.mod and go.sum. The shared and worker will be sibling directories
COPY shared/go.mod shared/go.sum ../shared/

# Download dependencies for worker and shared (will download for shared too because dependent)
RUN go mod download

# Copy the full source code for worker and shared
COPY build-worker/ ./
COPY shared/ ../shared/

# Build binary
RUN go build -o /app/worker/worker ./cmd

# Final minimal image
FROM golang:1.24-alpine

# Copy binary from builder
COPY --from=builder /app/worker/worker /worker

EXPOSE 6000

CMD ["/worker"]