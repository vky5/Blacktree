// this package will be responsible for folder creading and deleting in the tmp folder

package dirman

import (
	"fmt"
	"os"
	// "path/filepath"
)

func CreateFolder(folderName string) error {
	// folder := filepath.Join("tmp/repos", folderName)

	// Ensure base repos/ directory exists
	if err := os.MkdirAll(folderName, 0755); err != nil {
		return fmt.Errorf("❌ failed to create directory: %w", err)
	}

	return nil
}
