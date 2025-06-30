import { Injectable } from '@nestjs/common';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { CreateConversationInput } from './dto/create-conversation.input';
import { SendMessageInput } from './dto/send-message.input';
import { UsersService } from '../users/users.service';

@Injectable()
export class ConversationsService {
  private conversations: Conversation[] = []; // Temporaire, à remplacer par une base de données
  private messages: Message[] = []; // Temporaire, à remplacer par une base de données

  constructor(private readonly usersService: UsersService) {}

  async create(createConversationInput: CreateConversationInput): Promise<Conversation> {
    const participants = await Promise.all(
      createConversationInput.participantIds.map(id => this.usersService.findOne(id))
    );

    const conversation: Conversation = {
      id: Date.now().toString(), // Temporaire, à remplacer par un UUID
      name: createConversationInput.name,
      participants: participants.filter(p => p !== undefined),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isGroup: createConversationInput.isGroup,
    };

    this.conversations.push(conversation);
    return conversation;
  }

  async findAll(): Promise<Conversation[]> {
    return this.conversations;
  }

  async findOne(id: string): Promise<Conversation | undefined> {
    return this.conversations.find(conv => conv.id === id);
  }

  async findUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversations.filter(conv => 
      conv.participants.some(p => p.id === userId)
    );
  }

  async sendMessage(senderId: string, input: SendMessageInput): Promise<Message> {
    const conversation = await this.findOne(input.conversationId);
    const sender = await this.usersService.findOne(senderId);

    if (!conversation || !sender) {
      throw new Error('Conversation or sender not found');
    }

    const message: Message = {
      id: Date.now().toString(), // Temporaire, à remplacer par un UUID
      content: input.content,
      sender,
      conversationId: conversation.id,
      createdAt: new Date(),
      isRead: false,
      readBy: [],
      attachmentUrl: input.attachmentUrl,
      attachmentType: input.attachmentType,
    };

    this.messages.push(message);
    conversation.messages.push(message);
    conversation.lastMessageSentBy = sender;
    conversation.lastMessageSentAt = message.createdAt;
    conversation.updatedAt = message.createdAt;

    return message;
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<Message | undefined> {
    const message = this.messages.find(m => m.id === messageId);
    const user = await this.usersService.findOne(userId);

    if (message && user && !message.readBy.some(u => u.id === userId)) {
      message.readBy.push(user);
      if (message.readBy.length === (await this.findOne(message.conversationId))?.participants.length) {
        message.isRead = true;
      }
    }

    return message;
  }
} 