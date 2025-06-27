package utils

import (
	"strings"
)



func GetRepoName(RepoURL string) string {
	urlParts := strings.Split(RepoURL, "/")
	repoName := urlParts[len(urlParts)-1]
	return strings.TrimSuffix(repoName, ".git")
}