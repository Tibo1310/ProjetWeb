import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsResolver } from './conversations.resolver';
import { UsersModule } from '../users/users.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    UsersModule, // Exporte UsersService ET UsersLoader
    RabbitMQModule,
    CacheModule,
  ],
  providers: [ConversationsService, ConversationsResolver],
  exports: [ConversationsService],
})
export class ConversationsModule {} 