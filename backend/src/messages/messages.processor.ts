import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { MessagesService } from './messages.service';

@Controller()
export class MessagesProcessor {
  constructor(private readonly messagesService: MessagesService) {}

  @EventPattern('message_sent')
  async handleMessageSent(message: any) {
    return this.messagesService.processMessage(message);
  }
} 