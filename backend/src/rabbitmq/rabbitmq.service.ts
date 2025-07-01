import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService {
  private connection: Connection;
  private channel: Channel;

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {
    this.connect();
  }

  private async connect() {
    try {
      this.connection = await connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      this.channel = await this.connection.createChannel();
    } catch (error) {
      console.error('Failed to connect to RabbitMQ', error);
    }
  }

  async emit(pattern: string, data: any): Promise<void> {
    await this.client.emit(pattern, data).toPromise();
  }

  async send(pattern: string, data: any): Promise<any> {
    return this.client.send(pattern, data).toPromise();
  }

  async sendMessage(queue: string, message: any) {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error('Failed to send message to RabbitMQ', error);
      throw error;
    }
  }

  async onApplicationShutdown() {
    await this.channel?.close();
    await this.connection?.close();
  }
} 