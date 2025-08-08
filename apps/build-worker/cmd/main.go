package main

import (
	"context"
	"log"
	"os"
	"time"

	workerpb "github.com/Blacktreein/Blacktree/apps/shared/proto/worker"
	"github.com/Blacktreein/Blacktree/build-worker/internal/grpc"
	"github.com/Blacktreein/Blacktree/build-worker/internal/utils"

	grpc2 "google.golang.org/grpc"
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
	}

	orchestratorAddr := os.Getenv("ORCHESTRATOR_ADDR") // e.g. "localhost:9000"
	if orchestratorAddr == "" {
		log.Fatal("❌ ORCHESTRATOR_ADDR not set")
	}

	port := 6000 // Default port for worker
	ip := "localhost"

	// Step 1: Register with orchestrator
	success := registerWithOrchestrator(workerID, orchestratorAddr, ip, port, "default")
	if !success {
		log.Fatal("❌ Registration with orchestrator failed, exiting...")
	}

	// Step 2: Start worker's gRPC server
	grpc.StartGRPCServer(port, workerID)
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

	client := workerpb.NewWorkerServiceClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

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

	log.Printf("✅ Registered with orchestrator: %s", res.Message)
	return res.Success
}
