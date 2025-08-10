// define's the worker's gRPC server struct and register the service

package grpc

import (
	"context"
	"fmt"
	"log"
	"net"
	"sync"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	jobpb "github.com/Blacktreein/Blacktree/apps/shared/proto/job"
)

type WorkerGRPCServer struct {
	jobpb.UnimplementedJobServiceServer
	mu       sync.Mutex
	isBusy   bool
	workerId string
}

// NewServer creates and returns a new gRPC server instance
func NewServer(workerid string) *grpc.Server {
	server := grpc.NewServer() // creating a new gRPC server
	jobpb.RegisterJobServiceServer(server, &WorkerGRPCServer{
		workerId: workerid,
	}) // register custom job service after implementation

	reflection.Register(server) // TODO remove this reflection
	return server
}

// starts GRPC server listeing for gRPC connection on the given port
func StartGRPCServer(port int, workerid string) {
	// creating a TCP listener on provided port (:50051)
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create the gRPC server with your JobService registered

	server := NewServer(workerid)
	log.Printf("gRPC server listening on port %d", port)

	// start serving
	if err := server.Serve(lis); err != nil {
		log.Fatalf("failed to serve : %v", err)
	}
}

// we are checking if the worker is free or not and if it is free then only we are assigning it the taask
func (w *WorkerGRPCServer) RunJob(ctx context.Context, req *jobpb.JobRequest) (*jobpb.JobResponse, error) {
	w.mu.Lock()
	if w.isBusy {
		w.mu.Unlock()
		return nil, fmt.Errorf("worker is currently busy")
	}
	w.isBusy = true
	w.mu.Unlock()

	defer func() {
		w.mu.Lock()
		w.isBusy = false
		w.mu.Unlock()
	}()

	return RunJobLogic(ctx, req)
}

func (w *WorkerGRPCServer) Ping(ctx context.Context, _ *jobpb.PingRequest) (*jobpb.PingResponse, error) {
	w.mu.Lock()
	defer w.mu.Unlock()

	status := jobpb.WorkerStatus_FREE

	if w.isBusy {
		status = jobpb.WorkerStatus_BUSY
	}

	return &jobpb.PingResponse{
		WorkerId: w.workerId,
		Status:   status,
	}, nil
}
