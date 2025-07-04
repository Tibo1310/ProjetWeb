import { Injectable, NotFoundException } from '@nestjs/common';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { CreateConversationInput } from './dto/create-conversation.input';
import { UpdateConversationInput } from './dto/update-conversation.input';
import { SendMessageInput } from './dto/send-message.input';
import { UsersService } from '../users/users.service';
import { UsersLoader } from '../users/users.loader';
import { CacheService } from '../cache/cache.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class ConversationsService {
  private conversations: Conversation[] = [];

  constructor(
    private readonly usersService: UsersService,
    private readonly usersLoader: UsersLoader,
    private readonly cacheService: CacheService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(createConversationInput: CreateConversationInput): Promise<Conversation> {
    // OPTIMISATION N+1: Utilisation de DataLoader pour batching
    const participants = await this.usersLoader.loadUsers(createConversationInput.participantIds);

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
    await this.cacheService.set(`conversation:${conversation.id}`, conversation);
    return conversation;
  }

  async findAll(): Promise<Conversation[]> {
    return this.conversations;
  }

  async findOne(id: string): Promise<Conversation> {
    const cachedConversation = await this.cacheService.get<Conversation>(`conversation:${id}`);
    if (cachedConversation) {
      return cachedConversation;
    }

    const conversation = this.conversations.find(conv => conv.id === id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    await this.cacheService.set(`conversation:${id}`, conversation);
    return conversation;
  }

  async findUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversations.filter(conv => conv.participantIds.includes(userId));
  }

  async update(updateConversationInput: UpdateConversationInput): Promise<Conversation> {
    const conversationIndex = this.conversations.findIndex(conv => conv.id === updateConversationInput.id);
    if (conversationIndex === -1) {
      throw new NotFoundException(`Conversation with ID ${updateConversationInput.id} not found`);
    }

    // OPTIMISATION N+1: Utilisation de DataLoader pour batching
    const participants = await this.usersLoader.loadUsers(updateConversationInput.participantIds);

    const updatedConversation: Conversation = {
      ...this.conversations[conversationIndex],
      name: updateConversationInput.name,
      participantIds: updateConversationInput.participantIds,
      participants,
      isGroup: participants.length > 2,
      updatedAt: new Date(),
    };

    this.conversations[conversationIndex] = updatedConversation;
    await this.cacheService.set(`conversation:${updatedConversation.id}`, updatedConversation);
    
    return updatedConversation;
  }

  async delete(id: string): Promise<boolean> {
    const conversationIndex = this.conversations.findIndex(conv => conv.id === id);
    if (conversationIndex === -1) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    this.conversations.splice(conversationIndex, 1);
    await this.cacheService.del(`conversation:${id}`);
    await this.cacheService.del(`messages:${id}`);
    
    return true;
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

    await this.cacheService.set(`conversation:${conversation.id}`, conversation);
    await this.cacheService.set(`messages:${conversation.id}`, conversation.messages.slice(-20));
    await this.rabbitMQService.sendMessage('chat.message.created', message);

    return message;
  }

  async getRecentMessages(conversationId: string): Promise<Message[]> {
    const cachedMessages = await this.cacheService.get<Message[]>(`messages:${conversationId}`);
    if (cachedMessages && cachedMessages.length > 0) {
      return cachedMessages;
    }

    const conversation = await this.findOne(conversationId);
    const recentMessages = conversation.messages.slice(-20);
    
    await this.cacheService.set(`messages:${conversationId}`, recentMessages);
    
    return recentMessages;
  }
} 