// define's the worker's gRPC server struct and register the service

package grpc

import (
	"fmt"
	"google.golang.org/grpc"
	"log"
	"net"

	"build-worker/internal/proto"
)


type WorkerGRPCServer struct {
	jobpb.UnimplementedJobServiceServer
}

// NewServer creates and returns a new gRPC server instance
func NewServer() *grpc.Server {
	server := grpc.NewServer()                                  // creating a new gRPC server
	jobpb.RegisterJobServiceServer(server, &WorkerGRPCServer{}) // register custom job service after implementation
	return server
}

// starts GRPC server listeing for gRPC connection on the given port
func StartGRPCServer(port int) {
	// creating a TCP listener on provided port (:50051)
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create the gRPC server with your JobService registered

	server := NewServer()
	log.Printf("gRPC server listening on port %d", port)

	// start serving
	if err := server.Serve(lis); err != nil {
		log.Fatalf("failed to serve : %v", err)
	}
}
