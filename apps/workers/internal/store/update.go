// update the field to change the status of a task or compose file location in the db 

package store

import (
	"database/sql"
)


func UpdateWorker(deploymentID string, status string, composePath sql.NullString) error {
	query := `
		UPDATE worker
		SET status = ?, composePath = ?, updatedAt = CURRENT_TIMESTAMP
		WHERE deploymentId = ?
	`

	_, err := DB.Exec(query, status, composePath, deploymentID)
	return err
}


