package dispatcher

import (
	"context"
	"log"
	"time"

	jobpb "github.com/Blacktreein/Blacktree/apps/shared/proto/job"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/queue"
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/workerman"
)

// ExecuteRunJobRPC triggers a worker to build the job and publishes the result
func ExecuteRunJobRPC(wm *workerman.WorkerManager, w *workerman.Worker, msg *queue.DeploymentMessage) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	wm.SetWorkerState(w.Info.Id, "busy")

	conn := w.GrpcConn
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

	wm.SetWorkerState(w.Info.Id, "free")

	if err != nil {
		log.Printf("❌ RunJob RPC failed for worker %s: %v", w.Info.Id, err)
		// Publish failed response to backend
		queue.PublishResponse(queue.ResultRoutingKey, queue.Response{
			DeploymentID: msg.DeploymentID,
			Success:      false,
			Logs:         "",
			Error:        err.Error(),
			ImageURL:     "",
		})
		return err
	}

	// Log job result
	if resp.Success {
		log.Printf("✅ Job %s built successfully by Worker %s\nLogs: %s\nImage URL: %s", resp.JobId, w.Info.Id, resp.Logs, resp.ImageUrl)
	} else {
		log.Printf("❌ Job %s failed on Worker %s. Error: %s", resp.JobId, w.Info.Id, resp.Error)
	}

	// Publish success/failure response to backend
	queue.PublishResponse(queue.ResultRoutingKey, queue.Response{
		DeploymentID: resp.JobId,
		Success:      resp.Success,
		Logs:         resp.Logs,
		Error:        resp.Error,
		ImageURL:     resp.ImageUrl, // ECR address
	})

	return nil
}
