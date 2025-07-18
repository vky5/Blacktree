// actually we need this func for the gRPC only but we are gonna separate this incase we need to call this logic from somewhere elsee

package workerman

import (
	workerpb "build-orchestrator/internal/proto"
	"context"
	"time"
)

func (wm *WorkerManager) RegisterWorker(ctx context.Context, info *workerpb.WorkerInfo) error {
	wm.mu.Lock()
	defer wm.mu.Unlock()

	wm.workers = append(wm.workers, &Worker{
		Info:     info,
		LastSeen: time.Now(),
		state:    "free",
	})

	return nil
}
