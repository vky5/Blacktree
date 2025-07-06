// this is for inserting data into the database

package store

// import (
// "database/sql"

// _ "github.com/mattn/go-sqlite3" // No, you don't need to import the driver again in create.go, as long as you've already done it once in the same binary
// Go's database/sql works with drivers registered via init() functions. The sqlite3 driver self-registers when its package is imported (even if blank-imported). Once that's done anywhere in your app, you're good to go across all files.
// _ "github.com/mattn/go-sqlite3" triggers its init() function → registers itself

// )

func InsertWorker(w Worker) error {
	// prepare the SQL statement
	query := `
INSERT INTO worker (
	deploymentId, status, composePath, imageName, contextDir, dockerfilePath, containerName, port
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(deploymentId) DO UPDATE SET
	status = excluded.status,
	composePath = excluded.composePath,
	imageName = excluded.imageName,
	contextDir = excluded.contextDir,
	dockerfilePath = excluded.dockerfilePath,
	containerName = excluded.containerName,
	port = excluded.port,
	updatedAt = CURRENT_TIMESTAMP
`

	_, err := DB.Exec(query,
		w.DeploymentID,
		w.Status,
		w.ComposePath,
		w.ImageName,
		w.ContextDir,
		w.DockerfilePath,
		w.ContainerName,
		w.Port,
	)
	return err

}
