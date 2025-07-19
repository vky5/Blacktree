package dispatcher

import (
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/queue"
	"context"
	"sync"
)

type DispatcherState struct {
	SendMessageToWorker chan queue.DeploymentMessage // Channel used to send deployment jobs to workers via gRPC
	FreeWorkerChan      chan string                  // a channel that checkHealthForAll() talks to and if there is any worker, it calles the RunJob
	// jobResultChan       chan queue.ResultMessage // message to be sent to MQ of control plane
	CancelMap map[string]context.CancelFunc // idk
	CancelMu  sync.Mutex                    // Mutex to ensure thread-safe access to the cancelMap from multiple goroutines
}

func NewDispatcherState(jobChan chan queue.DeploymentMessage, freeChan chan string) *DispatcherState {
	return &DispatcherState{
		SendMessageToWorker: jobChan,
		FreeWorkerChan:      freeChan,
		CancelMap:           make(map[string]context.CancelFunc),
	}
}
