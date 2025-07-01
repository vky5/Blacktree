package main

import (
	"fmt"
	"log"

	"github.com/streadway/amqp"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func man() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	exchangeName := "blacktree.direct"
	queueName := "blacktree.queue"
	routingKey := "blacktree.routingKey"

	// Declare exchange and queue
	err = ch.ExchangeDeclare(
		exchangeName, // name
		"direct",     // type
		true,         // durable
		false,        // auto-deleted
		false,        // internal
		false,        // no-wait
		nil,          // arguments
	)
	failOnError(err, "Failed to declare exchange")

	q, err := ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)

	failOnError(err, "Failed to declare queue")

	// Bind queue to exchange with routing key
	err = ch.QueueBind(
		q.Name,
		routingKey,
		exchangeName,
		false,
		nil,
	)
	failOnError(err, "Failed to bind queue")

	// Consume messages
	msgs, err := ch.Consume(
		q.Name,
		"",
		true,  // auto-ack
		false, // exclusive
		false,
		false,
		nil,
	)
	failOnError(err, "Failed to register consumer")

	fmt.Println("📥 Waiting for messages. To exit press CTRL+C")

	// Message handler loop
	forever := make(chan bool)
	go func() {
		for d := range msgs {
			fmt.Printf("🔔 Received message: %s\n", d.Body)
		}
	}()

	<-forever
}
