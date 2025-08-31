import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';
import { PublishDeploymentMessageDto } from './dto/publish-message.dto';
import { MQResponseDTO } from '../response-handler/mq-response.dto';

@Injectable()
export class MessagingQueueService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly exchange = 'blacktree.direct'; // implementing direct exchange
  private readonly queue = 'execute.queue'; // implementing queue
  private readonly routingKey = 'worker.execute'; // implementing routing key

  private readonly resultQueue = 'api.result.queue';
  private readonly resultRoutingKey = 'api.result';

  constructor(private readonly configService: ConfigService) {}

  // to run when the module is initialized in Dependency Injection
  async onModuleInit() {
    const rabbitMQUrl = this.configService.get<string>('MQ_URL');
    if (!rabbitMQUrl) {
      throw new Error('RABBITMQ_URL is not defined in the configuration');
    }

    try {
      this.connection = await connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();

      // setting up exchange, using direct exchange type
      await this.channel.assertExchange(this.exchange, 'direct', {
        durable: true,
      });

      // setting up queue (using durable queue)
      await this.channel.assertQueue(this.queue, {
        durable: true,
      });

      // setting up binding rules and routing key to the queue in the exchange
      await this.channel.bindQueue(this.queue, this.exchange, this.routingKey);

      // Bind status.queue for results once during init
      await this.channel.assertQueue(this.resultQueue, { durable: true });
      await this.channel.bindQueue(
        this.resultQueue,
        this.exchange,
        this.resultRoutingKey,
      );

      console.log('✅ RabbitMQ exchange and queues are set up successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occured';
      console.error(`Error connecting to RabbitMQ: ${message}`);
      throw new Error(`Failed to connect to RabbitMQ: ${message}`);
    }
  }

  // method to publish message to the queue
  publishMessage(routingKey: string, message: PublishDeploymentMessageDto) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }

    try {
      const buffer = Buffer.from(JSON.stringify(message));
      const published = this.channel.publish(
        this.exchange, // exchange name
        routingKey, // routing key
        buffer, // message buffer
        {
          persistent: true, // ensures message is saved to disk
        },
      );

      if (!published) {
        throw new Error('Message could not be published');
      }
      return {
        message: `Message published to exchange "${this.exchange}" with routing key "${routingKey}"`,
      };
    } catch (error) {
      console.log('Error publishing message:', error);
      throw new Error(
        `Failed to publish message: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  // run when the module is destroyed in Dependency Injection
  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('RabbitMQ connection and channel closed.');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }

  async consumeMessages(
    queueName: string,
    onMessage: (msg: MQResponseDTO) => void,
  ) {
    if (!this.channel) {
      console.error(
        'RabbitMQ channel is NOT initialized when trying to consume messages!',
      );
      throw new Error('RabbitMQ channel is not initialized');
    }

    console.log(`✅ Starting to listen for messages on queue: "${queueName}"`);

    try {
      await this.channel.consume(
        queueName,
        (msg) => {
          if (!msg) {
            console.warn('⚠️ Received null/undefined message');
            return;
          }

          try {
            const parsed = JSON.parse(msg.content.toString()) as MQResponseDTO;

            // Pass the parsed message to the handler
            onMessage(parsed);

            this.channel?.ack(msg);
          } catch (err) {
            console.error('❌ Failed to parse or handle message', err);
            this.channel?.nack(msg, false, false); // optionally reject the message
          }
        },
        { noAck: false },
      );
    } catch (err) {
      console.error('❌ Error while attaching consumer to queue:', err);
    }
  }
}
