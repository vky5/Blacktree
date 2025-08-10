package utils

import "fmt"

// InjectTokenInURL builds a full HTTPS GitHub repo URL with an optional token.
// Example:
//   owner/repo + token → https://<token>@github.com/owner/repo.git
//   owner/repo + nil   → https://github.com/owner/repo.git
func InjectTokenInURL(repoPath string, token *string) string {
	if token != nil && *token != "" {
		return fmt.Sprintf("https://%s@github.com/%s.git", *token, repoPath)
	}
	return fmt.Sprintf("https://github.com/%s.git", repoPath)
}
