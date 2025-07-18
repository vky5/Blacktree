// procedure will be
// 1. Take in the message from the queue
// 2. Assign a worker that job
// 3. Once the task to be processed is ack by the worker ack it in the queue

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"build-orchestrator/internal/queue"
	"build-orchestrator/internal/utils"
)

// Listens to Backend using RabbitMQ
func messageFromQueue(ctx context.Context, sendMessageToWorker chan queue.DeploymentMessage, consumer queue.Consumer) error {
	defer close(sendMessageToWorker)

	fmt.Println("📡 Listening for messages from API...")

	for {
		select {
		case <-ctx.Done(): // if we cancels the cont
			log.Println("📦 messageFromQueue stopped due to context cancel")
			return ctx.Err()

		default:
			msg, err := consumer.ConsumeOne() // this will recieve one message at a time
			if err := utils.FailedOnError("main", err, "failed to consume message"); err != nil {
				return err
			}

			if msg == nil {
				continue
			}

			log.Printf("📩 Received message: %s", string(msg.Body))

			var singleMessageFromQueue queue.DeploymentMessage

			if err := json.Unmarshal(msg.Body, &singleMessageFromQueue); err != nil {
				msg.Nack(false, false)
				utils.FailedOnError("main", err, "Invalid JSON in message")
				continue
			}

			// sending message to the channel
			sendMessageToWorker <- singleMessageFromQueue // since channel is unbuffered until this message is not processed, It will get stuck at this

			// acknowledge after successful handoff
			err = msg.Ack(false)
			if err != nil {
				log.Println("⚠️ Failed to ack message:", err)
			}

		}
	}

}

/*
func (d Delivery) Ack(multiple bool) error // function signature on struct

msg.Ack(false) means that this one particular msg is acknowledged and can be removed from the queue
msg.Ack(true) means that all the messages are acknowledged and can be removed even the untracked one

*/
