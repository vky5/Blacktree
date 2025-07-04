// this will run in separate go routine which will reads the repos.json and as soon as there are entries, it will create the build job
// using docker engine and builder_image.go

package main

import (
	"database/sql"
	"log"
	"strings"
	"time"
	"worker/internal/builder"
	"worker/internal/store"
	"worker/internal/tracker"
)

func builderLoop() {
	ticker := time.NewTicker(5 * time.Second) // checks after 5 seconds

	defer ticker.Stop()

	for {
		<-ticker.C

		entries, err := tracker.LoadAllEntries()

		if err != nil {
			log.Printf("⚠️ Failed to load tracker entries: %v\n", err)
			continue
		}

		for _, entry := range entries {
			msg, err := store.ReadWorker(entry.DeploymentID)

			if err != nil {
				log.Printf("⚠️ Failed to fetch deployment info for %s: %v\n", entry.DeploymentID, err)
				continue
			}


			if msg.Status != "cloned" {
				continue
			}

			err = store.UpdateWorker(entry.DeploymentID, "building", sql.NullString{Valid: false})
			if err != nil {
				log.Printf("⚠️ Failed to mark as building: %v", err)
				continue
			}

			log.Printf("🛠️ Starting build for %s (%s)\n", entry.Repo, entry.DeploymentID)

			safeBuild(&builder.BuildImageOptions{
				ImageName:      msg.ImageName.String,
				ContextDir:     "./tmp/repos/" + entry.Path + strings.TrimPrefix(msg.ContextDir.String, "."),
				DockerfilePath: "./tmp/repos/" + entry.Path + strings.Trim(msg.DockerfilePath.String, "."),
			}, msg.DeploymentID)
		}
	}

}
