// this is the entrypoint of the buil-orchestrator

// I will add emojis in logs

package main

import (
	"log"


	"build-orchestrator/internal/utils"
)

func main() {
	log.Println("🔄 Starting orchestrator")
	
	// Load env variables
	if err := utils.EnvInit("./.env"); err != nil {
		log.Fatalf("❌ Failed to load env variables: %v", err)
	}
	
	defer shutdownGracefully() // this will run at the end unless fatal exit

	// TODO: start orchestrator logic here
	log.Println("✅ Environment variables loaded successfully")

	// -------------------- connecting to queue ------------------------

}

