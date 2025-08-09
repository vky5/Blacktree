// this file is responsible for:
// using aws credentials to generate a temporary token using ecr get-password-login
// login to docker with username AWS and password earlier generated

package aws

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ecr"
	"github.com/docker/docker/api/types/registry"
	"github.com/docker/docker/client"
)

var RegistryURL *string              // exported pointer to registry URL
var DockerCli *client.Client         // exported pointer to Docker client
var Credentials *registry.AuthConfig // need for docker beacause read the docker file u will know

// the token expires in 12 hours so either refresh it before every job or
// create a cron like job for refreshing the token in every 12 hours
func LoginDockerToAWS() error {
	ctx := context.Background() // no cancellation needed

	// load AWS config from ~/.aws/credentials // FIXME remember that the base image of worker should include the aws credentials
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(os.Getenv("AWS_REGION")))
	if err != nil {
		return fmt.Errorf("failed to load AWS config: %v", err)

	}

	// Creating ECR client to generate the temporary password
	ecrClient := ecr.NewFromConfig(cfg)

	// getting ECR auth token
	authOut, err := ecrClient.GetAuthorizationToken(ctx, &ecr.GetAuthorizationTokenInput{}) // passing empty struct & means passing pointer
	if err != nil {
		return fmt.Errorf("failed to get ECR token: %v", err)

	}

	/*
		// we have one ECR registry per region per aws account

				AuthorizationData: [
			  {
			    AuthorizationToken: base64("AWS:<password>"),
			    ProxyEndpoint: "https://<account>.dkr.ecr.<region>.amazonaws.com" // this is registry in us-east-1 for example
			  }
			]
	*/

	authData := authOut.AuthorizationData[0]
	authToken := *authData.AuthorizationToken
	decoded, err := base64.StdEncoding.DecodeString(authToken)
	if err != nil {
		return fmt.Errorf("failed to decode auth token: %v", err)
	}
	parts := strings.Split(string(decoded), ":")
	username := parts[0]
	password := parts[1]
	RegistryURL = authData.ProxyEndpoint // already a pointer

	fmt.Println("ECR Registry: ", *RegistryURL)

	// creating docker client
	cli, err := client.NewClientWithOpts(client.FromEnv) // loads info like docker host, docker tls verify
	if err != nil {
		return fmt.Errorf("failed to create Docker client: %v", err)
	}
	DockerCli = cli

	// storing the credentials to be exported
	Credentials = &registry.AuthConfig{
		Username:      username,
		Password:      password,
		ServerAddress: *RegistryURL,
	}

	// Perform Docker login
	_, err = DockerCli.RegistryLogin(ctx, *Credentials)
	if err != nil {
		return fmt.Errorf("docker login failed: %v", err)
	}

	log.Println("✅ Successfully logged in to ECR")
	return nil
}
