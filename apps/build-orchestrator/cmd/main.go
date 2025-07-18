// this is the entrypoint of the buil-orchestrator

// I will add emojis in logs

package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"build-orchestrator/internal/queue"
	"build-orchestrator/internal/utils"
)

func main() {
	log.Println("🔄 Starting orchestrator")

	if err := run(); err != nil {
		log.Printf("❌ Fatal error: %v", err)
		os.Exit(1) // defer calls in `main()` are still respected because `run()` returned
	}
}

func run() error {
	// Load env variables
	if err := utils.EnvInit("./.env"); err != nil {
		return fmt.Errorf("failed to load env variables: %w", err)
	}

	defer shutdownGracefully()

	log.Println("✅ Environment variables loaded successfully")

	mqURL := os.Getenv("MQ_URL")
	if mqURL == "" {
		return fmt.Errorf("MQ_URL environment variable not set")
	}

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

	// start listening in a loop
	sendMessageToWorker := make(chan queue.DeploymentMessage) // creating an unbuffered channel

	// handling the graceful shutdown of queue
	ctx, cancel := context.WithCancel(context.Background()) // cancel() can be called to signal all goroutines watching ctx that they should stop.
	defer cancel()                                          // ensures that resources tied to the context are cleaned up when the function exits.

	errChan := make(chan error, 1)

	go func() { // listening to the messags from the queue taking in control of the speed the message is coming
		if err := messageFromQueue(ctx, sendMessageToWorker, *consumer); err != nil {
			errChan <- err
		}
	}()

	// for msg := range sendMessageToWorker {
	// 	// TODO processing logic for distribution of job to workers
	// 	select {
	// 	case <-ctx.Done(): //
	// 		log.Println("🛑 Orchestrator context cancelled")
	// 	case err := <-errChan: // if errChan is not empty
	// 		log.Printf("❌ Error received: %v", err)
	// 		return err
	// 	}

	// }

	return nil

}
