package main

import (
	"fmt"
	"worker/internal/repo"
)

func main() {
	// token := "gho_ip6SGJIqeG0orDlVl3nyWNcooOkPm2oX8J1"
	opt := repo.CloneRepoInput{
		RepoURL: "https://github.com/vky5/onspot.git",
		Branch:  "main",
		// Token:   &token,
	}

	err := repo.CloneRepo(opt)
	if err != nil {
		fmt.Println("Error cloning repo:", err)
		return
	}

}
