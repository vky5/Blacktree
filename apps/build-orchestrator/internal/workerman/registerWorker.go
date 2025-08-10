// actually we need this func for the gRPC only but we are gonna separate this incase we need to call this logic from somewhere elsee

package workerman

import (
	"context"
	"fmt"
	"log"
	"time"

	workerpb "github.com/Blacktreein/Blacktree/apps/shared/proto/worker"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func (wm *WorkerManager) RegisterWorker(ctx context.Context, info *workerpb.WorkerInfo) error {
	// Store worker struct without connection first
	wm.mu.Lock()
	wm.workers[info.Id] = &Worker{
		Info:     info,
		LastSeen: time.Now(),
		state:    "registering",
		GrpcConn: nil,
	}
	wm.mu.Unlock()

	// ---- Connect outside the lock ----
	conn, err := grpc.NewClient(fmt.Sprintf("%s:%d", info.Ip, info.Port), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("❌ Failed to dial worker %s: %v", info.Id, err)
		wm.SetWorkerState(info.Id, "dead")
		return err
	}

	wm.mu.Lock()
	wm.workers[info.Id].GrpcConn = conn
	wm.mu.Unlock()

	wm.SetWorkerState(info.Id, "free")
	log.Printf("✅ New Worker registered with ID: %s", info.Id)

	return nil
}
