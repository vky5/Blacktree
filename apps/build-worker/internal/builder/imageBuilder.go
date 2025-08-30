// this is responsible for creating the docker iamge from the message using buildkit

package builder

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

// buildImageOptions contains input for building the docker image
type BuildImageOptions struct {
	ImageName      string // e.g., "blacktree-worker:latest"
	ContextDir     string // e.g., "./tmp/repos/repo-name-timestamp"
	DockerfilePath string // e.g., "./tmp/repos/repo-name-timestamp/Dockerfile"
}

// buildImage buils the docker image using a shell scrit
func BuildImage(opt BuildImageOptions, folderName string) error {
	log.Printf("🔨 Starting Docker build...\n")
	fmt.Printf("📦 Image: %s\n", opt.ImageName)
	fmt.Printf("📁 Context: %s\n", opt.ContextDir)
	fmt.Printf("📄 Dockerfile: %s\n", opt.DockerfilePath)

	// shell script to use buildkit to create the docker image

	dockerfileFullPath := filepath.Join(opt.ContextDir, opt.DockerfilePath)
	cmd := exec.Command("./scripts/build.sh", opt.ImageName, opt.ContextDir, dockerfileFullPath, folderName)

	cmd.Stdout = os.Stdout //  Redirect stdout to terminall
	cmd.Stderr = os.Stderr // Redirect stderr to terminal

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("docker build failed: %w", err)
	}

	log.Println("✅ Docker image built successfully")
	return nil
}
