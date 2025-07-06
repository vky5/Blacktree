// the image name is provide and it will check whether the container is running or not.

package builder

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"
)

// IsContainerRunning checks if a container is running for a given image name
func IsContainerRunning(imageName string) (bool, error) {
	// Command: docker ps --filter ancestor=imageName --format "{{.ID}}"
	cmd := exec.Command("docker", "ps", "--filter", fmt.Sprintf("ancestor=%s", imageName), "--format", "{{.ID}}")

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return false, fmt.Errorf("failed to check running containers: %w", err)
	}

	// If output is not empty, at least one container is running with this image
	isRunning := strings.TrimSpace(out.String()) != ""
	return isRunning, nil
}