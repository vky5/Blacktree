// a single place to close all connections from db, queue etc

package main

import (
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/queue"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/workerman"
)

func shutdownGracefully(manager *workerman.WorkerManager) {
	queue.Close() // shutting down queue

	manager.CloseGRPCAll()
}
