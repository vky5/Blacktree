package grpc

import (
	"context"
	"fmt"

	"github.com/Blacktreein/Blacktree/build-worker/internal/aws"
	"github.com/Blacktreein/Blacktree/build-worker/internal/builder"
	jobpb "github.com/Blacktreein/Blacktree/apps/shared/proto/job"
	"github.com/Blacktreein/Blacktree/build-worker/internal/repo"
)

func RunJobLogic(ctx context.Context, req *jobpb.JobRequest) (*jobpb.JobResponse, error) {

	// first cloning the repo
	folder, err := repo.CloneRepo(repo.CloneRepoInput{
		RepoURL: req.RepoUrl,
		Branch:  req.Branch,
		Token:   &req.GithubToken,
	})

	if err != nil {
		return &jobpb.JobResponse{},

			fmt.Errorf("Failed to clone the repo: %v", err)
	}

	// build the image from the foldername
	builder.BuildImage(builder.BuildImageOptions{
		ImageName:      req.ImageName,
		ContextDir:     req.ContextDir,
		DockerfilePath: req.DockerfilePath,
	}, *folder)

	// upload this registry but before uploading to the registry regenrate the token for the ECR to login to the docker
	err = aws.LoginDockerToAWS()
	if err!=nil {
		return &jobpb.JobResponse{},
		fmt.Errorf("Failed to clone the repo")
	}

	// upload to the docker 
	err = builder.TagAndPushImage(ctx, aws.DockerCli, req.ImageName, *aws.Credentials,)
	if err!=nil {
		return &jobpb.JobResponse{}, nil
	}

	// send the status back to the orchestrator
	return &jobpb.JobResponse{}, nil

}
