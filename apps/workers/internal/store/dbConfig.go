// instead of opening and closing connection every time we want to do CRUD operation, we keep it open and perform the operations
// this is because opening and closing connection is expensive operation and we want to avoid it
// and we are gonna use goroutines to perform CRUD operations concurrently

package store

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3" // this means it is used as side-effect and not direct usage. Here working as driver for database/sql

	"log"
)

type Worker struct {
	DeploymentID   string
	Status         string
	ComposePath    sql.NullString
	ImageName      sql.NullString
	ContextDir     sql.NullString
	DockerfilePath sql.NullString
	ContainerName  sql.NullString
	Port           sql.NullInt64 // the port to which the container is listening at x:3000
}

var DB *sql.DB // this is exported gloabally so other files in same package can use it without importing and passing as parameter

func InitDB(path string) error {
	var err error
	DB, err = sql.Open("sqlite3", path)

	if err != nil {
		fmt.Println(err)
		return err
	}

	// Optional: fine-tune SQLite connection for concurrency
	DB.SetMaxOpenConns(1) // SQLite only allows 1 writer at a time, so keep it low
	DB.SetMaxIdleConns(1)

	// create table if not exists
	createTable := `
	CREATE TABLE IF NOT EXISTS worker (
		deploymentId   TEXT PRIMARY KEY NOT NULL,
		status         TEXT NOT NULL CHECK(status IN ('cloned', 'built', 'failed', 'ready', 'removed', 'building', "stopped")),
		createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
		composePath    TEXT UNIQUE,
		imageName      TEXT UNIQUE,
		contextDir     TEXT,
		dockerfilePath TEXT,
		containerName  TEXT,
		port           INTEGER
	);

	`

	_, err = DB.Exec(createTable)
	if err != nil {
		log.Fatal("Table creation failed:", err)
		return err

	}

	return nil
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}
