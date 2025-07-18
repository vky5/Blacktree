PROTO_DIR=./internal/proto

generate:
	protoc \
		--go_out=paths=source_relative:. \
		--go-grpc_out=paths=source_relative:. \
		$(PROTO_DIR)/worker.proto
