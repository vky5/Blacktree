package dirman

import (
	"log"
	"os"
)

// DeleteFolder deletes the specified folder and its contents recursively.
func DeleteFolder(folderName string) {
	err := os.RemoveAll(folderName)
	if err != nil {
		log.Printf("❌ Failed to delete folder %s: %v", folderName, err)
	} else {
		log.Printf("🧹 Successfully deleted folder: %s", folderName)
	}
}
