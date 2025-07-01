// this is to read a worker from the database


package store

import (
	"database/sql"
)

func ReadWorker(deploymentID string) (*Worker, error) {
	query := `
		SELECT deploymentId, status, composePath, imageName, contextDir, dockerfilePath, containerName, port
		FROM worker
		WHERE deploymentId = ?
	`

	row := DB.QueryRow(query, deploymentID)

	var w Worker

	// the order of the fields in the row.Scan(...) must match the order of the fields in the SELECT statement above. because order is specified in query

	err := row.Scan( // row.Scan(...) reads values from the SQL row in order, and writes them into the provided memory addresses.
		&w.DeploymentID, // it wants memory address of the variable to write the value into
		&w.Status, 
		&w.ComposePath,
		&w.ImageName,
		&w.ContextDir,
		&w.DockerfilePath,
		&w.ContainerName,
		&w.Port,
	)

	if err == sql.ErrNoRows {
		return nil, nil // not found is not an error
	}

	if err != nil { // in row.Scan if error occurs, err != nill 
		return nil, err
	}

	return &w, nil
}

