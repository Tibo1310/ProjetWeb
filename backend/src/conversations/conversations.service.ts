import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { CreateConversationInput } from './dto/create-conversation.input';
import { SendMessageInput } from './dto/send-message.input';
import { UsersService } from '../users/users.service';

@Injectable()
export class ConversationsService {
  private conversations: Conversation[] = [];
  private messages: Message[] = [];
  private nextConversationId = 1;
  private nextMessageId = 1;

  constructor(
    @InjectQueue('messages') private messagesQueue: Queue,
    private readonly usersService: UsersService
  ) {}

  async createConversation(createConversationInput: CreateConversationInput): Promise<Conversation> {
    const now = new Date();
    const conversation: Conversation = {
      id: this.nextConversationId++,
      name: createConversationInput.name,
      participants: createConversationInput.participantIds,
      messages: [],
      createdAt: now,
      updatedAt: now,
      isGroup: createConversationInput.participantIds.length > 2
    };
    this.conversations.push(conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | null> {
    return this.conversations.find(conv => conv.id === id) || null;
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    return this.conversations.filter(conv => conv.participants.includes(userId));
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return this.messages.filter(msg => msg.conversationId === conversationId);
  }

  async sendMessage(sendMessageInput: SendMessageInput): Promise<Message> {
    const sender = await this.usersService.findOne(sendMessageInput.senderId);
    if (!sender) {
      throw new Error('Sender not found');
    }

    const message: Message = {
      id: this.nextMessageId++,
      content: sendMessageInput.content,
      senderId: sendMessageInput.senderId,
      sender: sender,
      conversationId: sendMessageInput.conversationId,
      timestamp: new Date(),
      isRead: false,
      readBy: []
    };
    
    const conversation = await this.getConversation(sendMessageInput.conversationId);
    if (conversation) {
      conversation.messages.push(message.id);
      conversation.updatedAt = message.timestamp;
    }
    
    this.messages.push(message);
    return message;
  }

  async queueMessage(sendMessageInput: SendMessageInput): Promise<void> {
    await this.messagesQueue.add('saveMessage', sendMessageInput);
  }

  async findAll(): Promise<Conversation[]> {
    return this.conversations;
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<Message | undefined> {
    const message = this.messages.find(m => m.id === messageId);
    const user = await this.usersService.findOne(userId);
    
    if (message && user && !message.readBy.includes(userId)) {
      message.readBy.push(userId);
      
      const conversation = await this.getConversation(message.conversationId);
      if (conversation && message.readBy.length === conversation.participants.length) {
        message.isRead = true;
      }
    }
    
    return message;
  }
} 