package builder

import (
	"fmt"
	"os/exec"
	"strings"
)

// Stops all containers running a given image and deletes the image
func StopAndDeleteContainer(imageName string) error {
	// Step 1: Get all container IDs running the image
	cmd := exec.Command("sh", "-c", fmt.Sprintf("docker ps -a -q --filter ancestor=%s", imageName))
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("failed to list containers for image %s: %w", imageName, err)
	}

	containerIDs := strings.Fields(string(output))
	if len(containerIDs) == 0 {
		fmt.Printf("ℹ️ No containers found for image: %s\n", imageName)
	} else {
		// Step 2: Stop and remove each container
		for _, containerID := range containerIDs {
			fmt.Printf("🛑 Stopping container %s\n", containerID)
			exec.Command("docker", "stop", containerID).Run()
			fmt.Printf("🗑️ Removing container %s\n", containerID)
			exec.Command("docker", "rm", containerID).Run()
		}
	}

	// Step 3: Remove the image
	fmt.Printf("🧹 Removing image: %s\n", imageName)
	rmCmd := exec.Command("docker", "rmi", "-f", imageName)
	if err := rmCmd.Run(); err != nil {
		return fmt.Errorf("failed to remove image %s: %w", imageName, err)
	}

	fmt.Printf("✅ Successfully stopped containers and removed image: %s\n", imageName)
	return nil
}
