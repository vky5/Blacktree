package repo

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
	"worker/internal/tracker"
	"worker/internal/utils"
)

type CloneRepoInput struct {
	RepoURL string  // required
	Branch  string  // required
	Token   *string // optional (nil if not provided)
}

// CloneRepo clones the Git repo into a uniquely named folder under ./repos/
func CloneRepo(opt CloneRepoInput, deploymentId string) error {
	// Inject token if present
	if opt.Token != nil {
		opt.RepoURL = utils.InjectTokesInUrl(opt.RepoURL, opt.Token)
	}

	// cloning the repoository
	fmt.Printf("🔍 Cloning repository \n")

	// Extract repo name
	repoName := utils.GetRepoName(opt.RepoURL)

	// Create timestamped folder
	timestamp := time.Now().Unix()
	var folderName string = fmt.Sprint(repoName, "-", timestamp)
	folder := filepath.Join("tmp/repos", folderName)

	// Ensure base repos/ directory exists
	if err := os.MkdirAll("tmp/repos", 0755); err != nil {
		return fmt.Errorf("failed to create repos directory: %w", err)
	}

	// Prepare clone command
	cmd := exec.Command("git", "clone", "--branch", opt.Branch, opt.RepoURL, folder)
	// cmd.Stdout = os.Stdout // Redirect stdout to terminall
	// cmd.Stderr = os.Stderr // Redirect stderr to terminal

	fmt.Printf("🚀 Cloning into: %s\n", folder)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("git clone failed: %w", err)
	}

	// storing the entry in tracker
	tracker.SaveEntry(tracker.RepoEntry{
		DeploymentID: deploymentId, // taken from the input
		Path:         folderName,
		Repo:         repoName,
		Status:       "cloned",
		CreatedAt:    timestamp,
	})

	fmt.Println("✅ Repository cloned successfully")
	return nil
}