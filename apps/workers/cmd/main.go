package main

import (
	"fmt"
	"log"
	"worker/internal/queue"
	"worker/internal/store"
	"worker/internal/tracker"
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

	// ---------------------- Connecting to database sqlite -----------------
	fmt.Println("Connecting to database....")
	tracker.EnsureTrackerDir("./data/database.db") // to create the data folder before writing to db
	err = store.InitDB("./data/database.db")

	if err != nil {
		log.Fatalln("❌ DB init failed:", err)
	}

	defer store.Close() // close the connection to db when main func completes execution

	fmt.Println("Connecting to database completed......")

	// ----------------------- Connecting to database completed --------------------
	var recieveMessage chan queue.DeploymentMessage = make(chan queue.DeploymentMessage) // unbuffered channel because until the message is consumed from the channel we want that go routine to stop and wait  add buffer to increase concurrency


	go listenToAPI(recieveMessage) // this will listen to the docker images 
	go builderLoop() // this will run till the main function is working and complete its execution of building the docker images


	for msg := range recieveMessage {
		// handling message
		fmt.Println("🔧 Received message:", msg)
		//------------------------- processing recieved message -----------------------------
		consumeMessage(msg)

	}

}
