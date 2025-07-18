// actually we need this func for the gRPC only but we are gonna separate this incase we need to call this logic from somewhere elsee

package workerman

import (
	workerpb "build-orchestrator/internal/proto"
	"context"
	"time"
)

func RegisterWorkerLogic(ctx context.Context, req *workerpb.WorkerInfo) (*workerpb.RegisterAck, error) {
	mu.Lock()
	defer mu.Unlock()

	workers[req.Id] = &Worker{ // registering the worker in the array
		Info: req,
		LastSeen: time.Now(),
		IsAlive: true,
	}

	return &workerpb.RegisterAck{
		Message: "Worker registered successfully",
	}, nil
}
