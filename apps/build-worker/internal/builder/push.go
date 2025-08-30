// this package is responsible for pushing the docker image to the correct repository

// the repository is decied based on tag

package builder

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/registry"
	"github.com/docker/docker/client"
)

func TagAndPushImage(ctx context.Context, dockerCli *client.Client, imageName string, credentials registry.AuthConfig) error {
	// compose the full ECR tag by prepending the registry URL from credentials
	// AWS ECR only allows one level of repo, so "blacktree" must exist and imageName will be the tag
	repoName := "blacktree"                            // existing repo in ECR
	tag := strings.TrimPrefix(imageName, "blacktree/") // remove "blacktree/" if it exists
	fullECRTag := fmt.Sprintf("%s/%s:%s", strings.TrimSuffix(credentials.ServerAddress, "/"), repoName, tag)

	// tag the image
	if err := dockerCli.ImageTag(ctx, imageName, fullECRTag); err != nil {
		return fmt.Errorf("failed to tag image: %w", err)
	}

	// build the base64 encoded auth config
	authConfig := registry.AuthConfig{
		Username:      credentials.Username,
		Password:      credentials.Password,
		ServerAddress: credentials.ServerAddress,
	}

	encodedJSON, err := json.Marshal(authConfig)
	if err != nil {
		return fmt.Errorf("failed to marshal auth config: %w", err)
	}
	encodedAuth := base64.StdEncoding.EncodeToString(encodedJSON)

	// push the image
	pushResp, err := dockerCli.ImagePush(ctx, fullECRTag, image.PushOptions{
		RegistryAuth: encodedAuth, // base64'd auth JSON string
	})
	if err != nil {
		return fmt.Errorf("failed to push image: %w", err)
	}
	defer pushResp.Close()

	// stream the push logs to stdout
	_, err = io.Copy(os.Stdout, pushResp)
	if err != nil {
		return fmt.Errorf("failed to stream push logs: %w", err)
	}

	return nil
}

// when we do docker push from terminal it uses ~/.docker/config.json
// but the docker sdk client of go doesnt have the luxuary to access the config.json that's why for every such kind of operation we need to give it the access to the
// credentials and serveraddresss as ewll
