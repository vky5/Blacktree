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

// TagAndPushImage tags and pushes Docker image to ECR with UUID tag and :latest
func TagAndPushImage(ctx context.Context, dockerCli *client.Client, imageName string, uuidTag string, credentials registry.AuthConfig) error {
	repoName := "blacktree"
	registryURL := strings.TrimSuffix(credentials.ServerAddress, "/")
	fullTag := fmt.Sprintf("%s/%s:%s", registryURL, repoName, uuidTag)
	latestTag := fmt.Sprintf("%s/%s:latest", registryURL, repoName)

	tagImage := func(src, dst string) error {
		if err := dockerCli.ImageTag(ctx, src, dst); err != nil {
			trimmedSrc := strings.TrimPrefix(src, "blacktree/")
			if trimmedSrc != src {
				if err2 := dockerCli.ImageTag(ctx, trimmedSrc, dst); err2 == nil {
					return nil
				}
			}
			return fmt.Errorf("failed to tag image from %s to %s: %w", src, dst, err)
		}
		return nil
	}

	// Tag both
	if err := tagImage(imageName, fullTag); err != nil {
		return err
	}
	if err := tagImage(imageName, latestTag); err != nil {
		return err
	}

	// Prepare base64 auth
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

	// Push function with streaming logs
	pushImage := func(tagToPush string) error {
		pushResp, err := dockerCli.ImagePush(ctx, tagToPush, image.PushOptions{
			RegistryAuth: encodedAuth,
		})
		if err != nil {
			return fmt.Errorf("failed to push image %s: %w", tagToPush, err)
		}
		defer pushResp.Close()

		if _, err := io.Copy(os.Stdout, pushResp); err != nil {
			return fmt.Errorf("failed to stream push logs for %s: %w", tagToPush, err)
		}
		return nil
	}

	for _, t := range []string{fullTag, latestTag} {
		if err := pushImage(t); err != nil {
			return err
		}
	}

	fmt.Println("✅ Successfully pushed:", fullTag, "and", latestTag)
	return nil
}
