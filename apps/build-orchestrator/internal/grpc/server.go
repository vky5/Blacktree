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
	Manager *workerman.WorkerManager // using this 
}

// NewServer creates and returns a new gRPC server instance
func NewServer(manager *workerman.WorkerManager) *grpc.Server { // then we use it here to pass it in the struct that grpc is going to register with 
	server := grpc.NewServer() // creating a new gRPC server
	workerpb.RegisterWorkerServiceServer(server, &OrchestratorGRPCServer{
		Manager: manager,
	}) // register custom job service after implementation
	return server
}

// starts GRPC server listeing for gRPC connection on the given port
func StartGRPCServer(port int, manager *workerman.WorkerManager) { // see here we are passing the manager here. When the GRCP server is first created we also create an instance of this struct and pass it too use it 
	// creating a TCP listener on provided port (:50051)
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))

	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create the gRPC server using NewServer
	server := NewServer(manager)
	log.Printf("gRPC server listening to port %d", port)

	// start serving
	if err := server.Serve(lis); err != nil {
		log.Printf("failed to serve: %v", err)
	}

}

func (s *OrchestratorGRPCServer) Register(ctx context.Context, req *workerpb.WorkerInfo) (*workerpb.RegisterAck, error) {
	err := s.Manager.RegisterWorker(ctx, req) // calling this to decouple logic as much as possible between workerman and this grpc implementation of register
	if err != nil {
		return nil, err
	}

	return &workerpb.RegisterAck{Success: true}, nil
}

// aahh I am surely gonna forget what I did here
