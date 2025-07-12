Using pull based 

1. Message Dispatch is One-to-One
When a message is in the queue, RabbitMQ will not deliver it to multiple consumers at once. It:

Picks one consumer.

Sends the message to it.

Waits for ack() before removing it from the queue.

If the worker crashes or doesn’t ack(), the message requeues.

So, there's no competition between workers for the same message. RabbitMQ ensures that only one worker holds the message at a time.


 When a message is pulled (delivered to a worker) and not acked, here's what happens:
RabbitMQ marks it as "unacknowledged" and holds it in that state.

No other worker will receive that message while it's unacknowledged.

RabbitMQ waits until:

The worker sends an ack() → ✅ it's removed from the queue.

The worker sends a nack() or the connection/channel is lost → 🔁 it requeues the message, and only then is it sent to another available worker.


searl job processore
