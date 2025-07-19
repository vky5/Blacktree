// for connecting to the queue and also defining struct of the message

package queue

import (
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/utils"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

// for defining constants
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

// connecting to rabbitmq and declare exchange + queues
func Connect(connectionString string) (*amqp.Connection, error ){
	if connection != nil { // if connection called twice
		log.Println("⚠️ Already connected to RabbitMQ")
		return connection, nil
	}

	var err error

	connection, err = amqp.Dial(connectionString) // connecting to rabbit mq
	if err = utils.FailedOnError("[Rabbitmq Error]", err, "Failed to connect to RabbitMQ"); err != nil {
		return nil, err
	}

	channel, err = connection.Channel() // opening up a channel to exchange from connection
	if err = utils.FailedOnError("[Rabbitmq Error]", err, "Failed to open a channel"); err != nil {
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
	if err = utils.FailedOnError("[Rabbitmq Error]", err, "Failed to declare exchange"); err != nil {
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
	if err = utils.FailedOnError("[Rabbitmq Error]", err, "Queue declare failed"); err != nil {
		return err
	}
	err = channel.QueueBind(
		queueName,
		routingKey,
		exchange,
		false,
		nil,
	)
	return utils.FailedOnError("[Rabbitmq Error]", err, "Queue bind failed")
}

func Close() {
	log.Printf("🔄 Shutting the connection with queue")
	if channel != nil {
		if err := channel.Close(); err != nil {
			log.Printf("❌ Failed to close RabbitMQ channel: %v", err)
		}
	}
	if connection != nil {
		if err := connection.Close(); err != nil {
			log.Printf("❌ Failed to close RabbitMQ connection: %v", err)
		}
	}
	log.Printf("✅ Connection with queue has been closed")
}
