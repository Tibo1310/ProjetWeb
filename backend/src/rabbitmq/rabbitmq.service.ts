import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Channel, Connection, connect } from 'amqplib';
import { ConfigService } from '@nestjs/config';

type AmqpConnection = Connection & {
  createChannel(): Promise<Channel>;
  close(): Promise<void>;
};

type AmqpChannel = Channel & {
  close(): Promise<void>;
};

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnection;
  private channel: AmqpChannel;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
      this.connection = await connect(url) as AmqpConnection;
      this.channel = await this.connection.createChannel() as AmqpChannel;
      
      // Declare exchange
      await this.channel.assertExchange('chat', 'topic', { durable: false });
      
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.warn('Failed to connect to RabbitMQ. Messages will not be processed.');
      this.logger.debug(error);
      // Don't throw error to allow application to start without RabbitMQ
    }
  }

  async sendMessage(routingKey: string, message: any) {
    try {
      if (!this.channel) {
        this.logger.warn('RabbitMQ channel not available. Message not sent.');
        return;
      }

      await this.channel.publish(
        'chat',
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    } catch (error) {
      this.logger.error('Failed to send message to RabbitMQ:', error);
      // Don't throw error to prevent application from crashing
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
    }
  }
} 