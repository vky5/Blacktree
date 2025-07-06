package builder

import (
	"fmt"
	"log"
	"os/exec"
	portman "worker/internal/portMan"
)

// StartContainer starts a Docker container using the given image and port.
// It checks if the container is already running, and if not, starts it.
// If the image exposes a port, it maps a random available host port to the container port.
func StartContainer(deploymentID string, imageName string, containerPort *int) error {
	// 1. Check if container is already running
	isRunning, err := IsContainerRunning(imageName)
	if err != nil {
		log.Printf("❌ Error checking container status: %v", err)
		return err
	}

	if isRunning {
		log.Printf("⚠️ Container for image %s is already running", imageName)
		return nil
	}

	// 2. Assign port if needed
	var runCmd *exec.Cmd
	if containerPort != nil {
		hostPort, err := portman.GetFreePort()
		if err != nil {
			log.Printf("❌ Failed to get free host port: %v", err)
			return err
		}

		log.Printf("🔌 Mapping host port %d to container port %d for %s", hostPort, *containerPort, imageName)

		// docker run -d -p hostPort:containerPort imageName
		runCmd = exec.Command(
			"docker", "run", "-d",
			"-p", fmt.Sprintf("%d:%d", hostPort, *containerPort),
			"--name", fmt.Sprintf("blacktree-%s", deploymentID[:8]),
			imageName,
		)
	} else {
		// If no port needs to be mapped
		log.Printf("No Port to map")
		runCmd = exec.Command(
			"docker", "run", "-d",
			"--name", fmt.Sprintf("blacktree-%s", deploymentID[:8]),
			imageName,
		)
	}

	// Capture Docker output for better error logging
	output, err := runCmd.CombinedOutput()
	if err != nil {
		log.Printf("❌ Failed to start container for %s: %v", imageName, err)
		log.Printf("🪵 Docker output:\n%s", string(output))
		return err
	}

	log.Printf("✅ Successfully started container for image %s", imageName)
	return nil
}
