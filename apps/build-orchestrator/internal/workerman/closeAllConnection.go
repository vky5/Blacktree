// this is to close all grpc connection between orchestrator and worker

package workerman

import (
	"fmt"
	"time"
)

// Close the gprc connection of a single worker
func (wm *WorkerManager) CloseGRPCOne(workerID string) error {
	wm.mu.Lock()
	defer wm.mu.Unlock()

	worker, exists := wm.workers[workerID]
	if !exists {
		return fmt.Errorf("❌ No Worker found with ID: %s", workerID)
	}

	if worker.GrpcConn != nil {
		if err := worker.GrpcConn.Close(); err != nil {
			return fmt.Errorf("⚠️ Failed to close gRPC connection for worker %s: %v", workerID, err)
		}
		worker.GrpcConn = nil
	}

	worker.state = "dead"
	worker.LastSeen = time.Now()

	return nil
}

// Close all the grpc connections 
func (wm *WorkerManager) CloseGRPCAll() error {
	wm.mu.Lock()
	defer wm.mu.Unlock()

	for id, worker := range wm.workers {
		if worker.GrpcConn != nil {
			if err := worker.GrpcConn.Close(); err != nil {
				fmt.Printf("⚠️ Failed to close gRPC connection for worker %s: %v\n", id, err)
			}
			worker.GrpcConn = nil
		}
		worker.state = "dead"
		worker.LastSeen = time.Now()
	}

	return nil
}
