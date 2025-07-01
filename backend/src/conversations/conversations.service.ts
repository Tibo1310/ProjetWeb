import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
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
  private messages: Message[] = [];
  private nextConversationId = 1;
  private nextMessageId = 1;

  constructor(
    @InjectQueue('messages') private messagesQueue: Queue,
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(createConversationInput: CreateConversationInput): Promise<Conversation> {
    // Vérifier et récupérer les participants
    const participants = await Promise.all(
      createConversationInput.participantIds.map(id => this.usersService.findOne(id))
    );

    const conversation: Conversation = {
      id: Date.now().toString(),
      participantIds: createConversationInput.participantIds,
      participants,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mettre à jour les conversations des participants
    await Promise.all(
      conversation.participantIds.map(id => this.usersService.addConversation(id, conversation.id))
    );

    this.conversations.push(conversation);
    await this.cacheService.cacheConversation(conversation.id, conversation);
    return conversation;
  }

  async findAll(): Promise<Conversation[]> {
    return this.conversations;
  }

  async findOne(id: string): Promise<Conversation> {
    // Try to get from cache first
    const cachedConversation = await this.cacheService.getCachedConversation(id);
    if (cachedConversation) {
      return cachedConversation;
    }

    // If not in cache, get from "database"
    const conversation = this.conversations.find(conv => conv.id === id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Cache the conversation for future requests
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

    // Update cache
    await this.cacheService.cacheConversation(conversation.id, conversation);
    
    // Cache recent messages
    const recentMessages = conversation.messages.slice(-20); // Keep last 20 messages
    await this.cacheService.cacheRecentMessages(conversation.id, recentMessages);

    // Publish message to RabbitMQ for real-time updates
    await this.rabbitMQService.sendMessage('chat.message.created', message);

    return message;
  }

  async getConversation(id: number): Promise<Conversation | null> {
    return this.conversations.find(conv => conv.id === id) || null;
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

  async getRecentMessages(conversationId: string): Promise<Message[]> {
    // Try to get recent messages from cache
    const cachedMessages = await this.cacheService.getCachedRecentMessages(conversationId);
    if (cachedMessages && cachedMessages.length > 0) {
      return cachedMessages;
    }

    // If not in cache, get from conversation
    const conversation = await this.findOne(conversationId);
    const recentMessages = conversation.messages.slice(-20); // Keep last 20 messages
    
    // Cache the recent messages
    await this.cacheService.cacheRecentMessages(conversationId, recentMessages);
    
    return recentMessages;
  }
} 