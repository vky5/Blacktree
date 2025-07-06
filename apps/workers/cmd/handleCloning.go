// this is the 2nd step and will be responsible for
// 1. Writing to the repos.json (done internally by clone.go)
// 2. writing to sqlite
// 3. Cloning the repo in separate goroutine and only this goroutine will handle this task of cloning the repo not gonna spawn multiple go routine

package main

import (
	"fmt"
	"log"
	"worker/internal/queue"
	"worker/internal/repo"
	"worker/internal/store"
	"worker/internal/utils"
)

func handleCloningAndBuildingImage(msg queue.DeploymentMessage) {
	input := repo.CloneRepoInput{
		RepoURL: msg.Repository,
		Branch:  msg.Branch,
	}

	if msg.Token != "" {
		input.Token = &msg.Token
	}

	// Run CloneRepo in a separate goroutine
	go func() {
		err := repo.CloneRepo(input, msg.DeploymentID)

		status := "cloned"
		if err != nil {
			log.Printf("❌ Failed to clone repo for deployment %s: %v\n", msg.DeploymentID, err)
			status = "failed"
		} else {
			log.Printf("✅ Repo cloned successfully for deployment %s\n", msg.DeploymentID)
		}

		fmt.Println(msg.ComposeFilePath)

		// Write to SQLite with actual status
		entry := store.Worker{
			DeploymentID: msg.DeploymentID,
			Status:       status,

			// Fill these if available from msg:
			ComposePath:    utils.ToNullString(msg.ComposeFilePath),
			ImageName:      utils.ToNullString("blacktree/" + utils.Slugify(msg.Repository) + "-" + msg.DeploymentID[:8]),
			ContextDir:     utils.ToNullString(msg.ContextDir),
			DockerfilePath: utils.ToNullString(msg.DockerfilePath),
			Port:           utils.ToNullInt(msg.PortNumber),
		}

		log.Printf("Raw port string from message: %s", msg.PortNumber)

		if err := store.InsertWorker(entry); err != nil {
			log.Printf("⚠️ Failed to insert into DB for deployment %s: %v\n", msg.DeploymentID, err)
		} else {
			log.Printf("✅ Wrote entry successfully in ./data/database.db %s\n", msg.DeploymentID)
		}
	}()
}
