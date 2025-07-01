import { Injectable, NotFoundException } from '@nestjs/common';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { CreateConversationInput } from './dto/create-conversation.input';
import { SendMessageInput } from './dto/send-message.input';
import { UsersService } from '../users/users.service';
import { CacheService } from '../cache/cache.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class ConversationsService {
  private conversations: Conversation[] = [];

  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(createConversationInput: CreateConversationInput): Promise<Conversation> {
    const participants = await Promise.all(
      createConversationInput.participantIds.map(id => this.usersService.findOne(id))
    );

    const conversation: Conversation = {
      id: Date.now().toString(),
      participantIds: createConversationInput.participantIds,
      participants,
      messages: [],
      name: createConversationInput.name,
      isGroup: participants.length > 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.push(conversation);
    await this.cacheService.cacheConversation(conversation.id, conversation);
    return conversation;
  }

  async findAll(): Promise<Conversation[]> {
    return this.conversations;
  }

  async findOne(id: string): Promise<Conversation> {
    const cachedConversation = await this.cacheService.getCachedConversation(id);
    if (cachedConversation) {
      return cachedConversation;
    }

    const conversation = this.conversations.find(conv => conv.id === id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    await this.cacheService.cacheConversation(id, conversation);
    return conversation;
  }

  async findUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversations.filter(conv => conv.participantIds.includes(userId));
  }

  async addMessage(sendMessageInput: SendMessageInput): Promise<Message> {
    const conversation = await this.findOne(sendMessageInput.conversationId);
    
    const message: Message = {
      id: Date.now().toString(),
      content: sendMessageInput.content,
      senderId: sendMessageInput.senderId,
      conversationId: sendMessageInput.conversationId,
      createdAt: new Date(),
    };

    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    await this.cacheService.cacheConversation(conversation.id, conversation);
    
    const recentMessages = conversation.messages.slice(-20);
    await this.cacheService.cacheRecentMessages(conversation.id, recentMessages);

    await this.rabbitMQService.sendMessage('chat.message.created', message);

    return message;
  }

  async getRecentMessages(conversationId: string): Promise<Message[]> {
    const cachedMessages = await this.cacheService.getCachedRecentMessages(conversationId);
    if (cachedMessages && cachedMessages.length > 0) {
      return cachedMessages;
    }

    const conversation = await this.findOne(conversationId);
    const recentMessages = conversation.messages.slice(-20);
    
    await this.cacheService.cacheRecentMessages(conversationId, recentMessages);
    
    return recentMessages;
  }
} 