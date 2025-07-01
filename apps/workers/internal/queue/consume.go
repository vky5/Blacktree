package queue

import (
	"github.com/streadway/amqp"
)

// ConsumeMessage consumes one message from the specified queue.
// It auto-acks the message and returns the body.
func ConsumeMessage(queueName string) (*string, error) {
	if connection == nil {
		return nil, failOnError(nil, "RabbitMQ connection is not initialized")
	}

	ch, err := connection.Channel()
	if err := failOnError(err, "Failed to create a channel"); err != nil {
		return nil, err
	}
	defer ch.Close() // always close temporary channels

	msgs, err := ch.Consume(
		queueName, // queue
		"",        // consumer tag
		true,      // auto-ack
		false,     // exclusive
		false,     // no-local
		false,     // no-wait
		nil,       // args
	)
	if err := failOnError(err, "Failed to register a consumer"); err != nil {
		return nil, err
	}

	// Read one message from the channel
	msg, ok := <-msgs
	if !ok {
		return nil, amqp.ErrClosed
	}

	body := string(msg.Body)
	return &body, nil
}
