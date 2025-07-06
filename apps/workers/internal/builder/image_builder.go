package builder

import (
	"fmt"
	"os"
	"os/exec"
)

// BuildImageOptions contains input for building the Docker image
type BuildImageOptions struct {
	ImageName      string // e.g., "blacktree-worker:latest"
	ContextDir     string // e.g., "./tmp/repos/repo-name-timestamp"
	DockerfilePath string // e.g., "./tmp/repos/repo-name-timestamp/Dockerfile"
}

// BuildImage builds the Docker image using a shell script
func BuildImage(opt BuildImageOptions) error {
	fmt.Printf("🔨 Starting Docker build...\n")
	fmt.Printf("📦 Image: %s\n", opt.ImageName)
	fmt.Printf("📁 Context: %s\n", opt.ContextDir)
	fmt.Printf("📄 Dockerfile: %s\n", opt.DockerfilePath)

	// Command: sudo ./build.sh <image-name> <context-dir> <dockerfile-path>
	cmd := exec.Command("./scripts/build.sh", opt.ImageName, opt.ContextDir, opt.DockerfilePath)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("docker build failed: %w", err)
	}

	fmt.Println("✅ Docker image built successfully")
	return nil
}
