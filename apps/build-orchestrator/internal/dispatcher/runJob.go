package dispatcher

import (
	"context"
	"log"
	"time"

	jobpb "github.com/Blacktreein/Blacktree/apps/shared/proto/job"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/queue"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/workerman"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// to run the RPC from the worker
func ExecuteRunJobRPC(wm *workerman.WorkerManager, w *workerman.Worker, msg *queue.DeploymentMessage) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	wm.SetWorkerState(w.Info.Id, "busy")

	conn, err := grpc.NewClient(w.Info.Ip, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("❌ Failed to dial worker %s: %v", w.Info.Id, err)
		wm.SetWorkerState(w.Info.Id, "dead")
		return err
	}
	defer conn.Close()

	client := jobpb.NewJobServiceClient(conn)

	resp, err := client.RunJob(ctx, &jobpb.JobRequest{
		JobId:          msg.DeploymentID,
		RepoUrl:        msg.Repository,
		Branch:         msg.Branch,
		DockerfilePath: msg.DockerfilePath,
		ContextDir:     msg.ContextDir,
		ImageName:      "blacktree/" + msg.DeploymentID,
		GithubToken:    msg.Token,
	})

	// Free the worker regardless of success/failure
	wm.SetWorkerState(w.Info.Id, "free")

	if err != nil {
		log.Printf("❌ RunJob RPC failed for worker %s: %v", w.Info.Id, err)
		// Don't requeue dead worker
		return err
	}

	if resp.Success {
		log.Printf("✅ Job %s built successfully by Worker %s\nLogs: %s\nImage URL: %s", resp.JobId, w.Info.Id, resp.Logs, resp.ImageUrl)
	} else {
		log.Printf("❌ Job %s failed on Worker %s. Error: %s", resp.JobId, w.Info.Id, resp.Error)
	}

	return nil
}
