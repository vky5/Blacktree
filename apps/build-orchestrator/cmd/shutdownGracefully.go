// a single place to close all connections from db, queue etc

package main

import "github.com/Blacktreein/Blacktree/build-orchestrator/internal/queue"


func shutdownGracefully(){
	queue.Close() // shutting down queue
}
