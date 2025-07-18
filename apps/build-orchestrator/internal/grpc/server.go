// define's the orchestrator gRPC server struct and register the methods

package grpc

import (
	"context"
	"fmt"
	"google.golang.org/grpc"
	"log"
	"net"

	workerpb "build-orchestrator/internal/proto"
	"build-orchestrator/internal/workerman"
)

type OrchestratorGRPCServer struct {
	workerpb.UnimplementedWorkerServiceServer
}

// NewServer creates and returns a new gRPC server instance
func NewServer() *grpc.Server {
	server := grpc.NewServer()                                              // creating a new gRPC server
	workerpb.RegisterWorkerServiceServer(server, &OrchestratorGRPCServer{}) // register custom job service after implementation
	return server
}

// starts GRPC server listeing for gRPC connection on the given port
func StartGRPCServer(port int) {
	// creating a TCP listener on provided port (:50051)
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))

	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create the gRPC server using NewServer
	server := NewServer()
	log.Printf("gRPC server listening to port %d", port)

	// start serving
	if err := server.Serve(lis); err != nil {
		log.Printf("failed to serve: %v", err)
	}

}

func (s *OrchestratorGRPCServer) Register(ctx context.Context, req *workerpb.WorkerInfo) (*workerpb.RegisterAck, error) {
	return workerman.RegisterWorkerLogic(ctx, req) // calling this function whenever the Register is triggered
}
