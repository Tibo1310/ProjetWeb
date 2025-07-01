import { Module } from '@nestjs/common';
import { ClientsModule, Transport, RmqOptions } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService): Promise<RmqOptions> => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
            queue: configService.get<string>('RABBITMQ_QUEUE', 'messages_queue'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {} 