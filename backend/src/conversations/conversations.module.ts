import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConversationsService } from './conversations.service';
import { ConversationsResolver } from './conversations.resolver';
import { MessagesProcessor } from './conversations.processor';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'messages',
    }),
    UsersModule,
  ],
  providers: [ConversationsResolver, ConversationsService, MessagesProcessor],
})
export class ConversationsModule {} 