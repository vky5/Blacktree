// workman stands for workermanger
// this file handles the array of workers info and registering and deregistering them...

// and also periodically running the scheduler to check for the status of the workers

package workerman

import (
	workerpb "github.com/Blacktreein/Blacktree/apps/shared/proto/worker"

	"sync"
	"time"
)

type Worker struct {
	Info     *workerpb.WorkerInfo
	LastSeen time.Time
	state    string // state can be busy, free, dead
}

// keeping the array of all workers
type WorkerManager struct {
	mu            sync.Mutex // so that when a type (example a varible w Workermanager, w.Worker is updated no other goroutine intefres with it)
	workers       []*Worker
	roundRobinIdx int
	FreeWorkers   chan *Worker
}

// for safely updating the state of the worker
func (wm *WorkerManager) SetWorkerState(workerID string, state string) {
	wm.mu.Lock()
	defer wm.mu.Unlock()

	for _, w := range wm.workers {
		if w.Info.Id == workerID {
			w.state = state
			if state == "free"{
				select {
				case wm.FreeWorkers <-w:
				default:
				}
			}

			break
		}
	}
}

func NewWorkerManager(bufferSize int) *WorkerManager {
	return &WorkerManager{
		workers:     []*Worker{},
		FreeWorkers: make(chan *Worker, bufferSize), // initializing FreeWorkers channel
	}
}


