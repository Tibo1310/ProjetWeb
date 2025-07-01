import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Channel, Connection, connect } from 'amqplib';

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

  async onModuleInit() {
    try {
      this.connection = await connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672') as AmqpConnection;
      this.channel = await this.connection.createChannel() as AmqpChannel;
      
      // Declare exchange
      await this.channel.assertExchange('chat', 'topic', { durable: false });
      
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async sendMessage(routingKey: string, message: any) {
    try {
      await this.channel.publish(
        'chat',
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    } catch (error) {
      console.error('Failed to send message to RabbitMQ:', error);
      throw error;
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
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
} 