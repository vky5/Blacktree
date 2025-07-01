package queue

import (
	"github.com/streadway/amqp"
)

// PublishToQueue publishes a message to the specified routing key.
// queueName is NOT needed unless you want to enforce a specific queue binding beforehand.
func PublishToQueue(routingKey string, message []byte) error {
	if channel == nil {
		return failOnError(nil, "Channel is not initialized. Call Connect() first")
	}

	err := channel.Publish(
		exchange,    // exchange
		routingKey,  // routing key
		false,       // mandatory
		false,       // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        message,
		},
	)
	return failOnError(err, "Failed to publish message to queue")
}
