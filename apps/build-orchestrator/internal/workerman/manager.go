// workman stands for workermanger
// this file handles the array of workers info and registering and deregistering them...

// and also periodically running the scheduler to check for the status of the workers

package workerman

import (
	workerpb "github.com/Blacktreein/Blacktree/apps/shared/proto/worker"
	"google.golang.org/grpc"

	"sync"
	"time"
)

type Worker struct {
	Info     *workerpb.WorkerInfo
	LastSeen time.Time
	state    string           // state can be busy, free, dead, registering
	GrpcConn *grpc.ClientConn // grpc connection to the worker
}

// keeping the array of all workers
type WorkerManager struct {
	mu            sync.Mutex // so that when a type (example a varible w Workermanager, w.Worker is updated no other goroutine intefres with it)
	workers       map[string]*Worker
	roundRobinIdx int
	FreeWorkers   chan *Worker // channel to hold free workers
}

// for safely updating the state of the worker
func (wm *WorkerManager) SetWorkerState(workerID string, state string) {
	wm.mu.Lock()
	defer wm.mu.Unlock()

	// IMPORTANT an issue can arise if for some reason we set the state of already freeed worker as free which will lead to multiple free workers tyoe in the freeworkers
	// TODO address the IMPORTANT message

	worker, exists := wm.workers[workerID] // different from js actually getting the pointer to worker object 
	if !exists {
		return
	}

	worker.state = state
	if state == "free" {
		select {
		case wm.FreeWorkers <- worker: // if worker free store in the free workers channel
		default:
		}
	}
}

// NewWorkerManager creates a new WorkerManager with a buffered channel for free workers
func NewWorkerManager(bufferSize int) *WorkerManager { // bufferSize is the size of the channel for free workers
	return &WorkerManager{
		workers:     make(map[string]*Worker),
		FreeWorkers: make(chan *Worker, bufferSize), // initializing FreeWorkers channel
	}
}
