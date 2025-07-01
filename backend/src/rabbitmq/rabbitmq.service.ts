import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async emit(pattern: string, data: any): Promise<void> {
    await this.client.emit(pattern, data).toPromise();
  }

  async send(pattern: string, data: any): Promise<any> {
    return this.client.send(pattern, data).toPromise();
  }
} 