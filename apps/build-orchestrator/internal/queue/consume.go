// listen to the messages from the queues
// this is very generic and for every queue we can have a separate struct of consumer. We get the address and we can save it in a variable by calling the fucn add have fun with it

package queue

import (
	"github.com/Blacktreein/Blacktree/build-orchestrator/internal/utils"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Creates and returns a new Consumer for the given queue.
func NewConsumer(queueName string) (*Consumer, error) {
	if connection == nil || channel == nil {
		return nil, utils.FailedOnError("Publishing to queue", nil, "RabbitMQ connection/channel is not initialized")
	}

	msgChannel, err := channel.Consume(
		queueName, // queue
		"",        // consumer tag
		false,     // auto-ack // I will ack this when we off loaded a task to a worker (but will have to think about two worker getting same task for build)
		false,     // exclusive
		false,     // no-local
		false,     // no-wait
		nil,       // args
	)

	if err = utils.FailedOnError("[Rabbitmq Error]", err, "Failed to register a consumer"); err != nil {
		return nil, err
	}

	return &Consumer{
		QueueName:  queueName,
		MsgChannel: msgChannel,
	}, nil
}

// ConsumeOne reads one message (with timeout) from the consumer's queue
func (c *Consumer) ConsumeOne() (*amqp.Delivery, error) {
	select {
	case msg, ok := <-c.MsgChannel:
		if !ok {
			return nil, amqp.ErrClosed
		}
		return &msg, nil

	// case <-time.After(30 * time.Second):
	// 	log.Println("⌛ No message received in 30 seconds") // TODO comment this in production don't wanna ruin the fun
	// 	return nil, nil
	default:
		return nil, nil
	}
}
