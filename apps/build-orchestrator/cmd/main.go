// this is the entrypoint of the buil-orchestrator

/*
a job dispatcher with concurrency control, health checks, worker orchestration, gRPC coordination, and context-aware cancellation for jobs
*/

// I will add emojis in logs

package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/dispatcher"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/grpc"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/queue"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/utils"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/workerman"
)

func main() {
	log.Println("🔄 Starting orchestrator")
	ctx, cancel := context.WithCancel(context.Background()) // creating a main context for the orchestrator to close everything at once
	defer cancel()

	if err := run(ctx); err != nil {
		log.Printf("❌ Fatal error: %v", err)
		os.Exit(1) // defer calls in `main()` are still respected because `run()` returned
	}
}

func run(ctx context.Context) error {
	// ------ Load environment variables ------
	if err := utils.EnvInit("./.env"); err != nil {
		return fmt.Errorf("failed to load env variables: %w", err)
	}

	log.Println("✅ Environment variables loaded successfully")

	mqURL := os.Getenv("MQ_URL")
	if mqURL == "" {
		return fmt.Errorf("MQ_URL environment variable not set")
	}

	// ------ Connect to RabbitMQ ------
	_, err := queue.Connect(mqURL) // connecting to the
	if err != nil {
		return fmt.Errorf("failed to connect to messaging queue: %w", err)
	}

	// consumer logic for queue
	consumer, err := queue.NewConsumer(queue.ExecuteQueue)
	if err := utils.FailedOnError("[Rabbitmq Error]", err, "Failed to register a consumer"); err != nil {
		return err
	}

	log.Printf("🎧 Listening on queue: %s", consumer.QueueName)

	// ------- Initialize Worker Manager and Dispatcher State ------
	jobs := make(chan *queue.DeploymentMessage) // creating an unbuffered channel
	manager := workerman.NewWorkerManager(10)

	log.Println("🛠️ Worker manager initialized with 10 Free Worker Channels")
	go manager.StartHealthChecker(ctx, 2*time.Minute) // this will periodically check health in every 2 minutes
	log.Println("🩺 Health checker started for workers")

	ds := dispatcher.NewDispatcherState(jobs, manager)

	go grpc.StartGRPCServer(5051, manager) // start the gRPC server to acccept worker registration

	errChan := make(chan error, 1)

	// listening to the messags from the queue taking in control of the speed the message is coming
	drainAllMessages(*consumer)

	go func() {
		if err := messageFromQueue(ctx, jobs, *consumer); err != nil {
			errChan <- err
		}
	}()

	// starting the dispatcher
	go func() {
		if err := dispatcher.JobDispatcher(ctx, ds, manager); err != nil {
			log.Fatalf("Dispatcher error: %v", err)
		}
	}()

	defer shutdownGracefully(manager) // ensure graceful shutdown on exit
	
	
	// ❗BLOCK HERE until error or termination
	select {
	case err := <-errChan:
		shutdownGracefully(manager)
		return err
	case <-ctx.Done():
		shutdownGracefully(manager)
		return nil
	}

}

/*
1. Get the message from the queue and stored in unbuffered channel (this will hold the job message )
2. check for the free worker using Round Robin Logic

case 3a: free worker found
	1. If free worker returned, invoke the RPC call to create the build and store in ECR all through worker
	2. take away the message from unbuffered channel so the goroutine can return to its normal func and continue its operation and fetch new message from mq

case 3b: free worker not found
	1. if no new worker found, store the message in the unbuffered channel and use it like a storage
	2. Call the checkHealthForAll worker and that will check health sequentially for all workers and that will give the state of all workers if any is free give it the task
	3. incase the server returns the response of any worker that its task is done, it will first check if its unbuffered channel has any message

	case 4a: if it does
		assign the task to the to that worker
	case 4b: if it is empty
		set its status to free and keep listeiing the job

*/
