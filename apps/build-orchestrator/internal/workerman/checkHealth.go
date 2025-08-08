// this will also be an implementation on the state and it will ping all workers and ask for their health here the client is orchestrator and server is worker

package workerman

import (
	"context"
	"log"
	"sync"
	"time"

	jobpb "github.com/Blacktreein/Blacktree/apps/shared/proto/job"
)

func (wm *WorkerManager) StartHealthChecker(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Health checker stopped.")
			return
		case <-ticker.C:
			log.Println("Checking worker health...")
			err := wm.CheckHealthForAll()
			if err != nil {
				log.Printf("Health check error: %v", err)
			}
		}
	}
}

func (wm *WorkerManager) CheckHealthForAll() error {

	// this func is gonna create multiple goroutine each goroutine asking for the
	// state of worker by spawning the gorotuine
	var wg sync.WaitGroup // we wait for the goroutine to finish its task before calling wg.Done()

	wm.mu.Lock()
	workersCopy := make([]*Worker, 0, len(wm.workers)) // preallocate with expected size

	for _, worker := range wm.workers {
		workersCopy = append(workersCopy, worker)
	}

	wm.mu.Unlock()

	for _, worker := range workersCopy {
		wg.Add(1) // wg.Add(1) is like saying i + 1 to number of goroutin to wait for

		go func(w *Worker) { // defining the func

			defer wg.Done()
			// here goes grpc health check logic
			wm.pingWorker(w) // calling the func to actually call the ping method

		}(worker) // immediately calling the func back with the worker cool
	}

	wg.Wait()
	return nil
}

func (wm *WorkerManager) pingWorker(w *Worker) *Worker {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second) // wait for 3 seconds for the worker to respond
	defer cancel()

	// ---- Old method of non persistent connection. Since I am gonna make connection persistent after the worker registers it is gonna send their IP as well which we will then use to open the connection no need to store the IP address ( or maybe if you want to retry connection if closes accidently) no let's keep the IP thingy
	// //  each worker stores its address in Info
	// conn, err := grpc.NewClient(w.Info.Ip, grpc.WithTransportCredentials(insecure.NewCredentials())) // create a new grpc connection to the worker
	// if err != nil {
	// 	log.Printf("Failed to dial worker %s: %v", w.Info.Id, err)
	// 	wm.SetWorkerState(w.Info.Id, "dead")
	// 	return nil
	// }
	// defer conn.Close() // to close the connection at the end

	conn := w.GrpcConn

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

	return nil
}
