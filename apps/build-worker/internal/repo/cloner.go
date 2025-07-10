// this file will be responsible for cloning the repo

package repo

import (
	dirman "build-worker/internal/dirMan"
	"build-worker/internal/utils"
	"fmt"
	"path/filepath"
	"time"

	"log"
	"os/exec"
)

type CloneRepoInput struct {
	RepoURL string
	Branch  string
	Token   *string // this can be nil
}

// CloneRepo clones the git repo into a uniquely nade folder under ./tmp/repos

func CloneRepo(opt CloneRepoInput) error {
	// Inject token if present
	if opt.Token != nil {
		opt.RepoURL = utils.InjectTokesInUrl(opt.RepoURL, opt.Token)
	}

	// cloning the repository
	log.Printf(" 🔄 cloning the repository")

	// Extract the repo name
	repoName := utils.GetRepoName(opt.RepoURL)
	timestamp := time.Now().Unix()
	folderName := fmt.Sprintf(repoName, "-", timestamp)
	folder := filepath.Join("tmp/repos", folderName)

	err := dirman.CreateFolder("tmp/repos")

	if err != nil {
		return err
	}

	// Prepare clone command
	cmd := exec.Command("git", "clone", "--branch", opt.Branch, opt.RepoURL, folder)
	// cmd.Stdout = os.Stdout // Redirect stdout to terminall
	// cmd.Stderr = os.Stderr // Redirect stderr to terminal

	log.Printf("🔄 Cloning into: %s\n", folder)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("git clone failed: %w", err)
	}

	log.Println("✅ Repository cloned successfully")
	return nil
}
