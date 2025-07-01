import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessagesService } from './messages.service';
import { MessagesProcessor } from './messages.processor';
import { MessagesResolver } from './messages.resolver';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MESSAGES_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:password@localhost:5672'],
          queue: 'messages_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [MessagesService, MessagesProcessor, MessagesResolver],
  exports: [MessagesService],
})
export class MessagesModule {} 