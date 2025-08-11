
# Builder image
FROM golang:1.24-alpine AS builder

WORKDIR /app/orchestrator

# Copy go.mod and go.sum of orchestrator (which includes shared module as a dependency)
COPY build-orchestrator/go.mod build-orchestrator/go.sum ./

# Copy shared module's go.mod and go.sum. The shared and orchestrator will be sibling directories
COPY shared/go.mod shared/go.sum ../shared/

# Download dependencies for orchestrator and shared (will download for shared too because dependent)
RUN go mod download

# Copy the full source code for orchestrator and shared
COPY build-orchestrator/ ./
COPY shared/ ../shared/

# Build binary
RUN go build -o /app/orchestrator/orchestrator ./cmd

# Final minimal image
FROM golang:1.24-alpine

# Copy binary from builder
COPY --from=builder /app/orchestrator/orchestrator /orchestrator

EXPOSE 5051

CMD ["/orchestrator"]
