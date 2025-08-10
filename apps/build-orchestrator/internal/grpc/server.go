// define's the orchestrator gRPC server struct and register the methods

package grpc

import (
	"context"
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"

	workerpb "github.com/Blacktreein/Blacktree/apps/shared/proto/worker"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/workerman"
	"google.golang.org/grpc/reflection"
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

	reflection.Register(server)  // TODO remove this reflection
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
	log.Printf("Received Register request from worker ID: %s, IP: %s, Port: %d", req.Id, req.Ip, req.Port)
	err := s.Manager.RegisterWorker(ctx, req)
	if err != nil {
		log.Printf("Register error: %v", err)
		return nil, err
	}
	log.Printf("Successfully registered worker ID: %s", req.Id)
	return &workerpb.RegisterAck{Success: true}, nil
}

// aahh I am surely gonna forget what I did here

/*

When your worker's gRPC server receives a request (e.g. RunJob), it runs each handler in a separate goroutine by default.


When you register your service with gRPC using:


pb.RegisterWorkerServiceServer(grpcServer, &Worker{})
and then call:

grpcServer.Serve(listener)

The gRPC server:
Starts listening for requests

For each incoming request, it spins up a new goroutine to handle that RPC call

So your handler function runs concurrently and independently
*/
