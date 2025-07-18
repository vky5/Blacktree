// this is to store all the types definition of queue package

package queue

import amqp "github.com/rabbitmq/amqp091-go"

// Consumer handles message consumption from a specific queue
type Consumer struct {
	QueueName  string
	MsgChannel <-chan amqp.Delivery
}

type DeploymentMessage struct { // this is the message that is recieved from the backend
	DeploymentID    string `json:"deploymentId"`
	Token           string `json:"token"`
	Repository      string `json:"repository"`
	Branch          string `json:"branch"`
	DockerfilePath  string `json:"dockerFilePath"`
	ContextDir      string `json:"contextDir"`
	CreatedAt       string `json:"createdAt"`
	AutoDeploy      bool
}


// Respose from orchestrator to backend to update the status
type Response struct {

}