// this is to store all the types definition of queue package

package queue

import amqp "github.com/rabbitmq/amqp091-go"

// Consumer handles message consumption from a specific queue
type Consumer struct {
	QueueName  string
	MsgChannel <-chan amqp.Delivery
}

type DeploymentMessage struct { // this is the message that is recieved from the backend
	DeploymentID   string `json:"deploymentId"`
	Token          string `json:"token"`
	Repository     string `json:"repository"`
	Branch         string `json:"branch"`
	DockerfilePath string `json:"dockerFilePath"`
	ContextDir     string `json:"contextDir"`
	CreatedAt      string `json:"createdAt"`
	AutoDeploy     bool
}

// response sent over messaging queue
type Response struct {
	DeploymentID string `json:"deploymentId"` // ID of the deployment/job
	ImageURL     string `json:"imageUrl"`     // Full ECR image URL
	Success      bool   `json:"success"`      // Job success status
	Logs         string `json:"logs"`         // Build logs
	Error        string `json:"error"`        // Error message if any
}
