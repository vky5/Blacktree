// delete the data from deploymentId

package store

func DeleteWorker(deploymentID string) error {
	query := `
		DELETE FROM worker
		WHERE deploymentId = ?
	`

	_, err := DB.Exec(query, deploymentID)
	if err != nil {
		return err
	}

	return nil
}