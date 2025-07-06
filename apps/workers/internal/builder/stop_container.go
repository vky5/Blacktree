// stop all the contiainers created from the given image name and remove them.
package builder

import (
	"fmt"
	"os/exec"
	"strings"
)

// StopContainer stops all containers created from the given image name and removes them.
func StopContainer(imageName string) error {
	// Step 1: List all container IDs using the image
	cmd := exec.Command("docker", "ps", "-a", "-q", "--filter", fmt.Sprintf("ancestor=%s", imageName))
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("failed to list containers for image %s: %w", imageName, err)
	}

	containers := strings.Fields(string(output))
	if len(containers) == 0 {
		fmt.Printf("🛑 No containers found for image %s\n", imageName)
		return nil
	}

	fmt.Printf("🛑 Found %d container(s) for image %s. Stopping...\n", len(containers), imageName)

	// Step 2: Stop each container
	for _, id := range containers {
		stopCmd := exec.Command("docker", "stop", id)
		if err := stopCmd.Run(); err != nil {
			fmt.Printf("⚠️ Failed to stop container %s: %v\n", id, err)
			continue
		}

		// Step 3: Remove container after stopping
		rmCmd := exec.Command("docker", "rm", id)
		if err := rmCmd.Run(); err != nil {
			fmt.Printf("⚠️ Failed to remove container %s: %v\n", id, err)
			continue
		}

		fmt.Printf("✅ Stopped and removed container %s\n", id)
	}

	return nil
}
