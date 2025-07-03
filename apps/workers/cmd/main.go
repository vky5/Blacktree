package main

import (
	"fmt"
	"log"
	"worker/internal/queue"
)

func main() {
	// -----------------  connect to the rabbitmq ---------------------
	fmt.Println("Connecting to the rabbitmq...")
	_, err := queue.Connect("amqp://guest:guest@localhost:5672")

	if err != nil {
		// log.Fatalf("Failed to connect to the queue : " + err.Error()) // this skips defers entirely
		log.Println("❌ Failed to connect to queue:", err)
		return // this triggers deferred functions

	}

	defer queue.Close() // ensures channel and connection are closed when main exits normally
	fmt.Println("Connected Successfully")


	// -------------------- Rabbit MQ Set Up Completed ----------------------
	var recieveMessage chan string = make(chan string) // unbuffered channel because until the message is consumed from the channel we want that go routine to stop and wait  add buffer to increase concurrency

	go listenToAPI(recieveMessage)

	for msg := range recieveMessage {
		// handling message
		fmt.Println("🔧 Received message:", msg)
	}

}
