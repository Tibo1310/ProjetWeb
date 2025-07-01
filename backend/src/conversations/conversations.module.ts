import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsResolver } from './conversations.resolver';
import { UsersModule } from '../users/users.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    UsersModule,
    RabbitMQModule,
  ],
  providers: [ConversationsService, ConversationsResolver],
  exports: [ConversationsService],
})
export class ConversationsModule {} 