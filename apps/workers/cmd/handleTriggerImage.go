// This is the function that will handle the trigger message type

package main

import (
	"database/sql"
	"log"
	"strconv"

	"worker/internal/builder"
	"worker/internal/queue"
	"worker/internal/store"
)

func handleTriggerImage(msg queue.DeploymentMessage) {
	log.Printf("🚀 Trigger received for Deployment ID: %s", msg.DeploymentID)

	// Convert incoming port number (if any) from string to int
	var containerPort *int
	if msg.PortNumber != "" {
		if port, err := strconv.Atoi(msg.PortNumber); err == nil {
			containerPort = &port
		} else {
			log.Printf("⚠️ Invalid port number in trigger message: %v", err)
		}
	}

	// Read worker info from the database
	info, err := store.ReadWorker(msg.DeploymentID)
	if err != nil {
		log.Printf("❌ Failed to read worker info for deployment %s: %v", msg.DeploymentID, err)
		return
	}

	// If image name is missing, log and skip
	if !info.ImageName.Valid || info.ImageName.String == "" {
		log.Printf("❌ No valid image name found for deployment %s", msg.DeploymentID)
		return
	}

	// Prefer existing port info if available
	if info.Port.Valid {
		portVal := int(info.Port.Int64)
		containerPort = &portVal
	}

	// Start the container using builder package
	err = builder.StartContainer(msg.DeploymentID, info.ImageName.String, containerPort)
	if err != nil {
		store.UpdateWorker(msg.DeploymentID, "failed", sql.NullString{Valid: false})
		log.Printf("❌ Failed to start container for deployment %s: %v", msg.DeploymentID, err)
		return
	}

	// Update status and container info
	store.UpdateWorker(msg.DeploymentID, "running", sql.NullString{String: msg.Repository, Valid: true})
	log.Printf("✅ Successfully triggered container for deployment %s", msg.DeploymentID)
}
