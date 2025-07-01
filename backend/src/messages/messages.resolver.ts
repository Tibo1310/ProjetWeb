import { Resolver, Mutation, Args, Subscription, Query } from '@nestjs/graphql';
import { Message } from './models/message.model';
import { SendMessageInput } from './dto/send-message.input';
import { MessagesService } from './messages.service';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private readonly messagesService: MessagesService) {}

  @Query(() => [Message])
  async messagesByConversation(@Args('conversationId') conversationId: string): Promise<Message[]> {
    return this.messagesService.getMessagesByConversation(conversationId);
  }

  @Mutation(() => Message)
  async sendMessage(@Args('input') input: SendMessageInput): Promise<Message> {
    const message = {
      id: Math.random().toString(36).substr(2, 9), // Temporaire, à remplacer par un vrai ID
      content: input.content,
      senderId: input.senderId,
      conversationId: input.conversationId,
      createdAt: new Date(),
      isRead: false,
    };

    await this.messagesService.sendMessage(message);
    return message as unknown as Message;
  }

  @Subscription(() => Message, {
    name: 'messageSent',
    filter: (payload, variables) => {
      // Ici, nous pouvons ajouter une logique de filtrage si nécessaire
      // Par exemple, ne recevoir que les messages d'une conversation spécifique
      return true;
    },
  })
  messageSent() {
    return this.messagesService.subscribeToMessages();
  }
} 