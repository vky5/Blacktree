package dispatcher

import (
	"context"
	"sync"

	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/queue"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/workerman"
)

type DispatcherState struct {
	JobQueue      chan *queue.DeploymentMessage // jobs pulled from RabbitMQ
	CancelMap     map[string]context.CancelFunc
	CancelMapLock sync.Mutex
	WorkerManager *workerman.WorkerManager // manager contains freeWorkersChan internally
}

func NewDispatcherState(jobQueue chan *queue.DeploymentMessage, wm *workerman.WorkerManager) *DispatcherState {
	return &DispatcherState{
		JobQueue:      jobQueue,
		CancelMap:     make(map[string]context.CancelFunc),
		WorkerManager: wm,
	}
}
