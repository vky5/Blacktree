package portman

import (
	"errors"
	"sync"
)

const (
	minPort = 3000
	maxPort = 10000
)

var (
	usedPorts = make(map[int]bool)
	mutex     sync.Mutex
)

// GetFreePort returns the lowest available port in the range [minPort, maxPort]
func GetFreePort() (int, error) {
	mutex.Lock()
	defer mutex.Unlock()

	for port := minPort; port <= maxPort; port++ {
		if !usedPorts[port] {
			usedPorts[port] = true
			return port, nil
		}
	}
	return 0, errors.New("no available ports")
}

// ReleasePort makes the port available again
func ReleasePort(port int) error {
	if port < minPort || port > maxPort {
		return errors.New("port out of range")
	}

	mutex.Lock()
	defer mutex.Unlock()

	if !usedPorts[port] {
		return errors.New("port was not in use")
	}

	delete(usedPorts, port)
	return nil
}
