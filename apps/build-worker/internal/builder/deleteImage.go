package builder

import (
	"log"
	"os/exec"
)

// DeleteImage removes a local Docker image by its name or tag using the Docker CLI.
func DeleteImage(imageName string) {
	cmd := exec.Command("docker", "rmi", "-f", imageName)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("❌ Failed to delete image %s: %v\nOutput: %s", imageName, err, string(output))
		return
	}

	log.Printf("✅ Successfully deleted image %s\nOutput: %s", imageName, string(output))
}
