import { Module } from '@nestjs/common';
import { MessageResolver } from './message.resolver';
import { MessageController } from './message.controller';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [MessageResolver],
  controllers: [MessageController],
})
export class MessagesModule {} 