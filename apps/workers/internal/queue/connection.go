package queue

import (
	"log"

	"github.com/streadway/amqp"
)

type DeploymentMessage struct { // this is the message that is recieved from the backend
	Type            string `json:"type"`
	DeploymentID    string `json:"deploymentId"`
	Token           string `json:"token"` // optional
	Repository      string `json:"repository"`
	Branch          string `json:"branch"`
	DockerfilePath  string `json:"dockerFilePath"`
	ComposeFilePath string `json:"composeFilePath"`
	ContextDir      string `json:"contextDir"`
	CreatedAt       string `json:"createdAt"`
	PortNumber      string `json:"portNumber"` // the port number to which the container is listening at x:3000
}

var (
	connection *amqp.Connection
	channel    *amqp.Channel
	exchange   = "blacktree.direct"
)

// Routing keys and queues
const (
	ExecuteRoutingKey = "worker.execute"
	ExecuteQueue      = "execute.queue"

	ResultRoutingKey = "api.result"
	ResultQueue      = "status.queue"
)

// Fail on error utility
func failOnError(err error, msg string) error {
	if err != nil {
		log.Printf("[RabbitMQ Error] %s: %s", msg, err)
		return err
	}
	return nil
}

// Connect to RabbitMQ and declare exchange + queues
func Connect(connectionString string) (*amqp.Connection, error) {
	if connection != nil {
		return connection, nil
	}

	var err error
	connection, err = amqp.Dial(connectionString) // connecting to rabbit mq
	if err := failOnError(err, "Failed to connect to RabbitMQ"); err != nil {
		return nil, err
	}

	channel, err = connection.Channel() // opening up a channel to exchange from connection
	if err := failOnError(err, "Failed to open a channel"); err != nil {
		return nil, err
	}

	// Declare exchange
	err = channel.ExchangeDeclare(
		exchange, // name
		"direct", // type
		true,     // durable
		false,    // auto-deleted
		false,    // internal
		false,    // no-wait
		nil,      // arguments
	)
	if err := failOnError(err, "Failed to declare exchange"); err != nil {
		return nil, err
	}

	// Declare and bind queues
	if err := declareAndBindQueue(ExecuteQueue, ExecuteRoutingKey); err != nil {
		return nil, err
	}

	if err := declareAndBindQueue(ResultQueue, ResultRoutingKey); err != nil {
		return nil, err
	}

	return connection, nil
}

// Helper to declare and bind a queue
func declareAndBindQueue(queueName, routingKey string) error {
	_, err := channel.QueueDeclare(
		queueName,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // args
	)
	if err := failOnError(err, "Queue declare failed: "+queueName); err != nil {
		return err
	}

	err = channel.QueueBind(
		queueName,
		routingKey,
		exchange,
		false,
		nil,
	)
	return failOnError(err, "Queue bind failed: "+queueName)
}

func Close() {
	if channel != nil {
		channel.Close()
	}
	if connection != nil {
		connection.Close()
	}
}
