package grpc

import (
	"context"
	"fmt"
	"strings"

	jobpb "github.com/Blacktreein/Blacktree/apps/shared/proto/job"
	"github.com/Blacktreein/Blacktree/build-worker/internal/aws"
	"github.com/Blacktreein/Blacktree/build-worker/internal/builder"
	"github.com/Blacktreein/Blacktree/build-worker/internal/repo"
)

func RunJobLogic(ctx context.Context, req *jobpb.JobRequest) (*jobpb.JobResponse, error) {
	select {
	case <-ctx.Done():
		fmt.Println("Execution cancelled...")
		return &jobpb.JobResponse{
			JobId:   req.JobId,
			Success: false,
			Error:   "Execution cancelled by context",
		}, nil
	default:
		// Step 1: Clone the repository
		folder, err := repo.CloneRepo(repo.CloneRepoInput{
			RepoURL: req.RepoUrl,
			Branch:  req.Branch,
			Token:   &req.GithubToken,
		})
		if err != nil {
			return &jobpb.JobResponse{
				JobId:   req.JobId,
				Success: false,
				Error:   fmt.Sprintf("Failed to clone the repo: %v", err),
			}, err
		}

		// Step 2: Build Docker image
		err = builder.BuildImage(builder.BuildImageOptions{
			ImageName:      req.ImageName,
			ContextDir:     req.ContextDir,
			DockerfilePath: req.DockerfilePath,
		}, *folder)
		if err != nil {
			return &jobpb.JobResponse{
				JobId:   req.JobId,
				Success: false,
				Error:   fmt.Sprintf("Failed to build Docker image: %v", err),
			}, err
		}

		// Step 3: Login to ECR
		err = aws.LoginDockerToAWS()
		if err != nil {
			return &jobpb.JobResponse{
				JobId:   req.JobId,
				Success: false,
				Error:   "Failed to authenticate Docker with AWS",
			}, err
		}

		// Step 4: Push Docker image to registry
		err = builder.TagAndPushImage(ctx, aws.DockerCli, req.ImageName, *aws.Credentials)
		if err != nil {
			return &jobpb.JobResponse{
				JobId:   req.JobId,
				Success: false,
				Error:   fmt.Sprintf("Failed to push Docker image: %v", err),
			}, err
		}

		// Step 5: Return success response
		reg := strings.TrimPrefix(*aws.RegistryURL, "https://") // clean URL
		ecrURL := fmt.Sprintf("%s/%s", reg, req.ImageName)

		return &jobpb.JobResponse{
			JobId:    req.JobId,
			Success:  true,
			Logs:     "Build and push successful",
			ImageUrl: ecrURL,
			Error:    "",
		}, nil
	}
}
