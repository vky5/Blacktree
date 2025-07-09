// this is to store all the types definition of queue package

package queue

import amqp "github.com/rabbitmq/amqp091-go"

// Consumer handles message consumption from a specific queue
type Consumer struct {
	QueueName  string
	MsgChannel <-chan amqp.Delivery
}

// Respose from orchestrator to backend to update the status
type Response struct {

}