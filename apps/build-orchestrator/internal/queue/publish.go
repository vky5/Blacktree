// this is to send the messages back to any queue.
// will use it to send the status to the backend

package queue

import (
	"build-orchestrator/internal/utils"
	"encoding/json"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

// publish a response struct as a JSON message to the specified routing key
func PublishResponse(routingKey string, resp Response) error {
	if connection == nil || channel == nil {
		return utils.FailedOnError("Publishing to queue", nil, "RabbitMQ connection/channel is not initialized")
	}

	message, err := json.Marshal(resp)
	if err != nil {
		return utils.FailedOnError("Publishing to queue", err, "Failed to marshal response to JSON")
	}

	err = channel.Publish(
		exchange,   // exchange
		routingKey, // routing key
		false,      // mandatory
		false,      // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        message,
		},
	)

	log.Printf("✅ Successfully published messages to %s", routingKey)
	return utils.FailedOnError("Publishing to queue", err, "Failed to publish message to queue")
}
