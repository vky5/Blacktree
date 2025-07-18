//

package workerman

import (
	workerpb "build-orchestrator/internal/proto"
	"sync"
	"time"
)


type Worker struct {
	Info       *workerpb.WorkerInfo
	LastSeen   time.Time
	IsAlive    bool
}

// using maps for fastest lookups for WorkerId
var (
	mu sync.Mutex
	workers = make(map[string]*Worker)
)