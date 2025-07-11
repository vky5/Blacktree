// to load the env files in the entire code

package utils

import (
	"github.com/joho/godotenv"
)

func EnvInit(fileName string) error {
	err := godotenv.Load(fileName)
	return FailedOnError("Env Variables", err, "Failed to load env variables")

}