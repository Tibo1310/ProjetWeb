import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ConversationsService } from './conversations.service';
import { SendMessageInput } from './dto/send-message.input';

@Processor('messages')
export class MessagesProcessor {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Process('saveMessage')
  async handleSaveMessage(job: Job<SendMessageInput>) {
    console.log('Processing message:', job.data);
    return this.conversationsService.sendMessage(job.data);
  }
} 