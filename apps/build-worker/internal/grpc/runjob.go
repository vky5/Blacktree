package grpc

import (
	"context"
	"fmt"
	"strings"

	jobpb "github.com/Blacktreein/Blacktree/apps/shared/proto/job"
	"github.com/Blacktreein/Blacktree/build-worker/internal/aws"
	"github.com/Blacktreein/Blacktree/build-worker/internal/builder"
	dirman "github.com/Blacktreein/Blacktree/build-worker/internal/dirManager"
	"github.com/Blacktreein/Blacktree/build-worker/internal/repo"
)

// RunJobLogic handles the job request: clone, build, push
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
	}

	// Step 1: Clone repository
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
	defer dirman.DeleteFolder(*folder) // always clean up

	// Step 2: Login to AWS ECR
	err = aws.LoginDockerToAWS()
	if err != nil {
		return &jobpb.JobResponse{
			JobId:   req.JobId,
			Success: false,
			Error:   fmt.Sprintf("Failed to authenticate Docker with AWS: %v", err),
		}, err
	}

	// Step 3: Build Docker image
	err = builder.BuildImage(builder.BuildImageOptions{
		ImageName:      req.ImageName, // base name only
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

	// Step 4: Push Docker image with UUID tag
	uuidTag := req.JobId // using JobId as unique tag
	err = builder.TagAndPushImage(ctx, aws.DockerCli, req.ImageName, uuidTag, *aws.Credentials)
	if err != nil {
		return &jobpb.JobResponse{
			JobId:   req.JobId,
			Success: false,
			Error:   fmt.Sprintf("Failed to push Docker image: %v", err),
		}, err
	}

	// Step 5: Prepare final ECR image URL
	registry := strings.TrimPrefix(*aws.RegistryURL, "https://")
	imageURL := fmt.Sprintf("%s/blacktree:%s", registry, uuidTag)

	// Optional: remove local image
	builder.DeleteImage(req.ImageName)

	return &jobpb.JobResponse{
		JobId:    req.JobId,
		Success:  true,
		Logs:     "Build and push successful",
		ImageUrl: imageURL,
		Error:    "",
	}, nil
}
