import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';
import { PublishDeploymentMessageDto } from './dto/publish-message.dto';
import { TriggerDeployment } from './dto/trigger-message.dto';
import { DeleteDeployment } from './dto/delete-message.dto';
import { StopMessage } from './dto/stop-message.dto';

@Injectable()
export class MessagingQueueService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly exchange = 'blacktree.direct'; // implementing direct exchange
  private readonly queue = 'execute.queue'; // implementing queue
  private readonly routingKey = 'worker.execute'; // implementing routing key

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
      await this.channel?.assertExchange(this.exchange, 'direct', {
        durable: true,
      });

      // setting up queue (using durable queue)
      await this.channel?.assertQueue(this.queue, {
        durable: true,
      });

      // setting up binding rules and routing key to the queue in the exchange
      await this.channel?.bindQueue(this.queue, this.exchange, this.routingKey);
      // console.log(
      //   'Connected to RabbitMQ and exchange/queue are set up successfully',
      // );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occured';
      console.error(`Error connecting to RabbitMQ: ${message}`);
      throw new Error(`Failed to connect to RabbitMQ: ${message}`);
    }
  }

  // method to publish message to the queue
  publishMessage(
    routingKey: string,
    message:
      | PublishDeploymentMessageDto
      | TriggerDeployment
      | DeleteDeployment
      | StopMessage,
  ) {
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
        `Failed to publish message: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
}
