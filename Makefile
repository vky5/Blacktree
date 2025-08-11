PROTOC            := protoc
PROTOC_GEN_GO     := $(shell which protoc-gen-go)
PROTOC_GEN_GRPC   := $(shell which protoc-gen-go-grpc)

PROTO_DIR         := apps/shared/proto
PROTO_FILES       := $(shell find $(PROTO_DIR) -name '*.proto')

.PHONY: all clean proto

all: proto

proto:
ifndef PROTOC_GEN_GO
	$(error "protoc-gen-go not found. Please install with: go install google.golang.org/protobuf/cmd/protoc-gen-go@latest")
endif
ifndef PROTOC_GEN_GRPC
	$(error "protoc-gen-go-grpc not found. Please install with: go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest")
endif
	@echo "Generating Go code from proto files..."
	@for file in $(PROTO_FILES); do \
		$(PROTOC) -I=apps/shared/proto \
			--go_out=paths=source_relative:apps/shared/proto \
			--go-grpc_out=paths=source_relative:apps/shared/proto \
			$$file || exit 1; \
	done

clean:
	@echo "Cleaning generated files..."
	@find $(PROTO_DIR) -name "*.pb.go" -type f -delete
	@find $(PROTO_DIR) -name "*_grpc.pb.go" -type f -delete




# Building docker images
docker-build-orchestrator:
	docker build -t blacktree/orchestrator:latest -f ./apps/build-orchestrator/Dockerfile ./apps

docker-build-worker:
	docker build -t blacktree/worker:latest -f ./apps/build-worker/Dockerfile ./apps


