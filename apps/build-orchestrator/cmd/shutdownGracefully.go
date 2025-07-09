// a single place to close all connections from db, queue etc

package main

import "build-orchestrator/internal/queue"


func shutdownGracefully(){
	queue.Close() // shutting down queue
}
