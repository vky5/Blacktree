// this will also be an implementation on the state and it will ping all workers and ask for their health here the client is orchestrator and server is worker

package workerman

import (
	"context"
	"log"
	"sync"
	"time"

	jobpb "github.com/Blacktreein/Blacktree/apps/shared/proto/job"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func (wm *WorkerManager) CheckHealthForAll() ([]*Worker, error) {

	// this func is gonna create multiple goroutine each goroutine asking for the
	// state of worker by spawning the gorotuine
	var wg sync.WaitGroup // we wait for the goroutine to finish its task before calling wg.Done()
	var mu sync.Mutex     // this is for updating the free workers array

	var freeWorkers []*Worker

	wm.mu.Lock()
	workersCopy := make([]*Worker, len(wm.workers))
	copy(workersCopy, wm.workers)
	wm.mu.Unlock()

	for _, worker := range workersCopy {
		wg.Add(1) // wg.Add(1) is like saying i + 1 to number of goroutin

		go func(w *Worker) { // defining the func

			defer wg.Done()
			// here goes grpc health check logic
			res := wm.pingWorker(w) // calling the func to actually call the ping method
			if res != nil {
				mu.Lock()
				freeWorkers = append(freeWorkers, res)
				mu.Unlock()
			}

		}(worker) // immediately calling the func back with the worker cool
	}

	wg.Wait()
	return freeWorkers, nil
}

func (wm *WorkerManager) pingWorker(w *Worker) *Worker {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	//  each worker stores its address in Info
	conn, err := grpc.NewClient(w.Info.Ip, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("Failed to dial worker %s: %v", w.Info.Id, err)
		wm.SetWorkerState(w.Info.Id, "dead")
		return nil
	}
	defer conn.Close() // to close the connection at the end

	// create client from generated GRPC code
	client := jobpb.NewJobServiceClient(conn)

	// resp, err := client.Ping(ctx, &jobpb.PingRequest{})
	resp, err := client.Ping(ctx, &jobpb.PingRequest{})
	if err != nil {
		log.Printf("Worker %s unhealthy or did not respond correctly", w.Info.Id)
		wm.SetWorkerState(w.Info.Id, "dead")
		return nil
	}
	// Handle based on the status enum
	switch resp.Status {
	case jobpb.WorkerStatus_UNKNOWN:
		log.Printf("Worker %s returned UNKNOWN status", w.Info.Id)
		wm.SetWorkerState(w.Info.Id, "dead")

	case jobpb.WorkerStatus_BUSY:
		wm.SetWorkerState(w.Info.Id, "busy")

	case jobpb.WorkerStatus_FREE:
		wm.SetWorkerState(w.Info.Id, "free")

	default:
		log.Printf("Worker %s returned unrecognized status: %v", w.Info.Id, resp.Status)
		wm.SetWorkerState(w.Info.Id, "dead")
	}

	if w.state == "free" {
		return w
	}

	return nil
}
