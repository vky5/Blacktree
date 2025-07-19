// this will also be an implementation on the state and it will ping all workers and ask for their health here the client is orchestrator and server is worker

package workerman

import (
	"context"
	"log"
	"sync"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func (wm *WorkerManager) CheckHealthForAll() error {

	// this func is gonna create multiple goroutine each goroutine asking for the
	// state of worker by spawning the gorotuine
	var wg sync.WaitGroup // we wait for the goroutine to finish its task before calling wg.Done()

	wm.mu.Lock()
	workersCopy := make([]*Worker, len(wm.workers))
	copy(workersCopy, wm.workers)
	wm.mu.Unlock()

	for _, worker:= range workersCopy {
		wg.Add(1) // wg.Add((1) is like saying i + 1 to number of goroutin

		go func (w *Worker) {  // defining the func
			defer wg.Done()
			// here goes grpc health check logic
			w.p


		}(worker) // immediately calling the func back with the worker cool 
	}

	return nil
}


func (wm *WorkerManager) pingWorker(w *Worker) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()


	//  each worker stores its address in Info 
	conn, err := grpc.NewClient(w.Info.Ip, grpc.WithTransportCredentials(insecure.NewCredentials()),)
	if err != nil {
		log.Printf("Failed to dial worker %s: %v", w.Info.Id, err)
		wm.SetWorkerState(w.Info.Id, "dead")
		return
	}
	defer conn.Close() // to close the connection at the end


	// create client from generated GRPC code 
	client := work

	


}