import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PubSub } from 'graphql-subscriptions';
import { Message } from './models/message.model';
import { User } from '../users/models/user.model';
import { Conversation } from '../conversations/models/conversation.model';

@Injectable()
export class MessagesService {
  private pubSub: PubSub;
  private messages: Message[] = []; // Temporaire, à remplacer par une vraie base de données

  constructor(
    @Inject('MESSAGES_SERVICE') private readonly client: ClientProxy,
  ) {
    this.pubSub = new PubSub();
  }

  async sendMessage(messageData: Partial<Message>): Promise<void> {
    // Publier le message dans la file d'attente RabbitMQ
    this.client.emit('message_sent', messageData);
  }

  async processMessage(messageData: any): Promise<Message> {
    // TODO: Récupérer les relations (user, conversation) depuis la base de données
    const message: Message = {
      ...messageData,
      sender: { id: messageData.senderId } as User,
      conversation: { id: messageData.conversationId } as Conversation,
    };

    // TODO: Sauvegarder le message en base de données
    this.messages.push(message);
    
    // Publier le message via GraphQL PubSub pour les clients abonnés
    await this.pubSub.publish('messageSent', { messageSent: message });
    return message;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    // TODO: Récupérer les messages depuis la base de données
    return this.messages.filter(msg => msg.conversation.id === conversationId);
  }

  async subscribeToMessages() {
    return this.pubSub.asyncIterator('messageSent');
  }
} 