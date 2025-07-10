package utils

import (
	"fmt"
	"strings"
)


func InjectTokesInUrl(repoUrl string, token *string) string {
	strippedURL := strings.TrimPrefix(repoUrl, "https://") // stripping https:// otherwise it will be added twice
	return  fmt.Sprintf("https://%s@%s", *token, strippedURL) // both %s acts as placeholders for the token and the stripped URL
}
// used to inject the token into the url for cloning the repo and make repo url like this: https://<token>@github.com/vky5/RaktConnect.git