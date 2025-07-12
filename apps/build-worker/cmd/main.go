// entry point of worker 
package main

import (
	"log"
	"build-worker/internal/utils"
)


func main(){
	log.Println("🔄 Starting build worker")
	
	// Load env variables
	if err := utils.EnvInit("./.env"); err != nil {
		log.Fatalf("❌ Failed to load env variables: %v", err)
	}

	log.Println()
	
}