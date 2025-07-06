// this is responsible for handling the stop message and stopping all the containers related to the image.

package main

import (
	"log"
	"worker/internal/builder"
	"worker/internal/queue"
)

// Handles the stop message: stops all containers related to the image
func handleStoppingImage(msg queue.DeploymentMessage) {
	log.Printf("🛑 Received stop message for image: %s (Deployment ID: %s)", msg.Repository, msg.DeploymentID)

	err := builder.StopContainer(msg.Repository)
	if err != nil {
		log.Printf("⚠️ Failed to stop container(s) for image %s: %v", msg.Repository, err)
		return
	}

	log.Printf("✅ Successfully stopped and cleaned up containers for image: %s", msg.Repository)
}
