import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsResolver } from './conversations.resolver';
import { UsersModule } from '../users/users.module';
import { RedisCacheModule } from '../cache/cache.module';
import { ConversationsProcessor } from './conversations.processor';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [UsersModule, RedisCacheModule, RabbitMQModule],
  providers: [ConversationsService, ConversationsResolver, ConversationsProcessor],
  exports: [ConversationsService],
})
export class ConversationsModule {} 