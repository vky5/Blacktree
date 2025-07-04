package utils

import "strings"

func Slugify(repoURL string) string {
	parts := strings.Split(repoURL, "/")
	repo := parts[len(parts)-1]
	return strings.ToLower(strings.TrimSuffix(repo, ".git"))
}
