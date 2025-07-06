// well it has been a month since I started this project. It is 6 July 2025 and I wish I could have polised it properly
// but this was just a learning project for me. I have learned a lot.

// aah the last script I am gonna write for this worker.... Hopefully I will update it as well. A lot of things are hardcoded here.

// a lot of things to add a lot of things to do. This is just me learning a bunch of technic

package main

// lol the import is cool here

import (
	"log"
	"worker/internal/builder"
	"worker/internal/queue"
	"worker/internal/store"
)

// handleDeleteImage handles the deletion of Docker images and their associated containers.
func handleDeleteImage(msg queue.DeploymentMessage) {
	log.Printf("🗑️ Received delete message for image: %s (Deployment ID: %s)", msg.Repository, msg.DeploymentID)

	readInfo, err := store.ReadWorker(msg.DeploymentID)
	if err != nil {
		log.Printf("⚠️ Failed to read worker info for deployment %s: %v ", msg.DeploymentID, err)
		return
	}
	if readInfo.ImageName.Valid {
		builder.StopAndDeleteContainer(readInfo.ImageName.String)
	} else {
		log.Printf("⚠️ ImageName is NULL for deployment %s", msg.DeploymentID)
	}

	log.Printf("✅ Successfully deleted image: %s", msg.Repository)
	store.DeleteWorker(msg.DeploymentID)
	log.Printf("🗑️ Successfully deleted worker info from database: %s", msg.DeploymentID)
}
