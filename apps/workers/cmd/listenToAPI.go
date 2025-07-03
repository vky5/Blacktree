// this file is to listen to the queue and process messages

// the message can be of two types:
// 1. Build a new docker image (from github repo)
// 2. Run a docker image (from dockerhub or local registry)
// this file is to listen to the api and process messages

package main

import (
	"fmt"
	"log"
	"worker/internal/queue"
)

func listenToAPI(sendMessage chan string) {
	fmt.Println("📡 Listening for messages from API...")

	for {
		msg, err := queue.ConsumeMessage(queue.ExecuteQueue)

		if err != nil {
			log.Println("❌ Failed to consume message from queue:", err)
			continue // try again
		}

		if msg == nil {
			log.Println("⏳ No message received, retrying...")
			continue
		}

		// send message body to processing pipeline
		sendMessage <- string(msg.Body)

		// acknowledge after successful handoff
		err = msg.Ack(false)

		if err != nil {
			log.Println("⚠️ Failed to ack message:", err)
		}

	}
}

/*
func (d Delivery) Ack(multiple bool) error // function signature on struct

msg.Ack(false) means that this one particular msg is acknowledged and can be removed from the queue
msg.Ack(true) means that all the messages are acknowledged and can be removed even the untracked one

*/
