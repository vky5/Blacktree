// actually we need this func for the gRPC only but we are gonna separate this incase we need to call this logic from somewhere elsee

package workerman

import (
	"context"
	"log"
	"time"

	workerpb "github.com/Blacktreein/Blacktree/apps/shared/proto/worker"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func (wm *WorkerManager) RegisterWorker(ctx context.Context, info *workerpb.WorkerInfo) error {
	wm.mu.Lock()
	defer wm.mu.Unlock()

	wm.workers[info.Id] = &Worker{
		Info:     info,
		LastSeen: time.Now(),
		state:    "registering",
		GrpcConn: nil,
	}

	// setup unary connection between worker and orchestrator here on every new registration of worker
	conn, err := grpc.NewClient(info.Ip, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("❌ Failed to dial worker %s: %v", info.Id, err)
		wm.SetWorkerState(info.Id, "dead")
		return err
	}

	wm.workers[info.Id].GrpcConn = conn
	wm.SetWorkerState(info.Id, "free") // set state to free and put it in free channel

	return nil
}
