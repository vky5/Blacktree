package queue

import (
	"github.com/streadway/amqp"
	"log"
	"time"
)

var msgChannel <-chan amqp.Delivery // persistent consumer stream

// ConsumeMessage consumes one message from the specified queue.
// It auto-acks the message and returns the body.
func ConsumeMessage(queueName string) (*amqp.Delivery, error) {
	if connection == nil {
		return nil, failOnError(nil, "RabbitMQ connection is not initialized")
	}

	// Reuse existing global consumer channel
	if msgChannel == nil {
		var err error
		msgChannel, err = channel.Consume(
			queueName, // queue
			"",        // consumer tag
			false,     // auto-ack // manually sending the ack message so that we can process one message at a time before recieving another message
			false,     // exclusive
			false,     // no-local
			false,     // no-wait
			nil,       // args
		)
		if err := failOnError(err, "Failed to register a consumer"); err != nil {
			return nil, err
		}
	}

	// Read one message from the channel
	select {
	case msg, ok := <-msgChannel: // first channel select 
		if !ok {
			return nil, amqp.ErrClosed
		}
		return &msg, nil

	case <-time.After(30 * time.Second): // optional timeout
		log.Println("No message received in time.")
		return nil, nil
	}
}
