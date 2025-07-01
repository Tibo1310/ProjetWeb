import { Resolver, Mutation, Args, Subscription } from '@nestjs/graphql';
import { Message } from './models/message.model';
import { SendMessageInput } from './dto/send-message.input';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => Message)
export class MessageResolver {
  private pubSub: PubSub;

  constructor(private readonly rabbitMQService: RabbitMQService) {
    this.pubSub = new PubSub();
  }

  @Mutation(() => Message)
  async sendMessage(@Args('input') input: SendMessageInput): Promise<Message> {
    // Créer un message temporaire avec un ID
    const message = {
      id: Math.random().toString(36).substr(2, 9),
      content: input.content,
      senderId: input.senderId,
      conversationId: input.conversationId,
      createdAt: new Date(),
    };

    // Publier le message dans RabbitMQ pour traitement asynchrone
    await this.rabbitMQService.emit('message.sent', message);

    return message as Message;
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => {
      // Vous pouvez ajouter une logique de filtrage ici
      // Par exemple, ne recevoir que les messages d'une conversation spécifique
      return true;
    },
  })
  messageSent() {
    return this.pubSub.asyncIterator('messageSent');
  }
} 