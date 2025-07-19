// this is where the logic for which worker gets the job goes.

package workerman

import workerpb "github.com/Blacktreein/Blacktree/apps/shared/proto/worker"

// Round robin selection over free workers
func (wm *WorkerManager) SelectNextWorker() *workerpb.WorkerInfo {
	wm.mu.Lock()
	defer wm.mu.Unlock()

	total := len(wm.workers)
	if total == 0 {
		return nil
	}

	start := wm.roundRobinIdx
	for i := 0; i < total; i++ {
		idx := (start + i) % total

		if wm.workers[idx].state == "free" {
			wm.roundRobinIdx = (idx + 1) % total
			return wm.workers[idx].Info
		}
	}

	return nil // if no free workers available
}

/*
Okay here is what actually going on
1. let's assume 4 messages come at once and we have 4 workers all free
2. The first message is taken, then from the selectNextWorkerRR() func, we are gonna select first free worker
3. We invoke the job func using RPC on that worker and set its status to busy
4. Then in queue ack that message has been handled through unbuffered channel and stopping goroutine fromt taking in more (pull based events)
5. Similarly do for the rest of the messages
6. if any of them has sent the respones of the RPC invoked, we set its state to freee
7. If 5th message come we go through all workers and select the first one that is free (we can use separate array for all free workers)
8. if 6th message comes when no worker is free, we keep that in unbuffered channel and halt recieveing new message until it is properly handled
9. Wait for response of worker that they are free or separately call all the workers to check which one is free
*/
