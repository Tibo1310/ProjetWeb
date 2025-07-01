import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PubSub } from 'graphql-subscriptions';
import { Message } from './models/message.model';

@Controller()
export class MessageController {
  private pubSub: PubSub;

  constructor() {
    this.pubSub = new PubSub();
  }

  @EventPattern('message.sent')
  async handleMessageSent(@Payload() message: any) {
    // TODO: Sauvegarder le message en base de données
    
    // Publier le message via GraphQL PubSub pour les clients abonnés
    await this.pubSub.publish('messageSent', { messageSent: message });
    
    return message;
  }
} 