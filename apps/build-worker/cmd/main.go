package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	workerpb "github.com/Blacktreein/Blacktree/apps/shared/proto/worker"
	"github.com/Blacktreein/Blacktree/build-worker/internal/grpc"
	"github.com/Blacktreein/Blacktree/build-worker/internal/utils"

	grpc2 "google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	log.Println("🛠️ Starting build worker")

	if err := utils.EnvInit("./.env"); err != nil {
		log.Fatalf("❌ Failed to load env variables: %v", err)
	}

	workerID := os.Getenv("WORKER_ID")
	if workerID == "" {
		workerID = "worker-" + time.Now().Format("150405")
		fmt.Printf("Worker Id is : %s\n", workerID)
	}

	orchestratorAddr := os.Getenv("ORCHESTRATOR_ADDR") // e.g. "localhost:9000"
	if orchestratorAddr == "" {
		log.Fatal("❌ ORCHESTRATOR_ADDR not set")
	}

	port := 6000 // Default port for worker to listen to grpc connection
	ip := "localhost"

	// Step 1: Start worker's gRPC server on different goroutine and contine to listen 
	go grpc.StartGRPCServer(port, workerID)
	time.Sleep(500 * time.Millisecond)

	// Step 2: Register with orchestrator
	success := registerWithOrchestrator(workerID, orchestratorAddr, ip, port, "us-east-1")
	if !success {
		log.Fatal("❌ Registration with orchestrator failed, exiting...")
	}
	select{} // blocks forever and wow it doesnt consumes cpu
	
}

// registerWithOrchestrator lets the worker register itself with the orchestrator
func registerWithOrchestrator(id, orchestratorAddress, ip string, port int, region string) bool {
	conn, err := grpc2.NewClient(orchestratorAddress, grpc2.WithTransportCredentials(insecure.NewCredentials()))
	// conn, err :=
	if err != nil {
		log.Printf("❌ Failed to connect to orchestrator: %v", err)
		return false
	}
	defer conn.Close()

	fmt.Printf("gRPC connection state: %v\n", conn.GetState())
	fmt.Printf("Is connection ready? %v\n", conn.GetState() == connectivity.Ready)

	client := workerpb.NewWorkerServiceClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	fmt.Printf("gRPC connection state after connect: %v\n", conn.GetState())

	res, err := client.Register(ctx, &workerpb.WorkerInfo{
		Id:     id,
		Ip:     ip,
		Port:   int32(port),
		Region: region,
	})

	if err != nil {
		log.Printf("❌ Registration failed: %v", err)
		return false
	}

	log.Printf("✅ Registered with orchestrator: %s", res)
	return res.Success
}
