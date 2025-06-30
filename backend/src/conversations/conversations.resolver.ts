import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ConversationsService } from './conversations.service';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { CreateConversationInput } from './dto/create-conversation.input';
import { SendMessageInput } from './dto/send-message.input';

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Query(() => [Conversation])
  async userConversations(@Args('userId', { type: () => Int }) userId: number) {
    return this.conversationsService.getUserConversations(userId);
  }

  @Query(() => [Message])
  async conversationMessages(@Args('conversationId', { type: () => Int }) conversationId: number) {
    return this.conversationsService.getConversationMessages(conversationId);
  }

  @Mutation(() => Conversation)
  async createConversation(@Args('createConversationInput') createConversationInput: CreateConversationInput) {
    return this.conversationsService.createConversation(createConversationInput);
  }

  @Mutation(() => Message)
  async sendMessage(@Args('sendMessageInput') sendMessageInput: SendMessageInput) {
    // Au lieu de sauvegarder directement le message, on l'ajoute à la queue
    await this.conversationsService.queueMessage(sendMessageInput);
    return this.conversationsService.sendMessage(sendMessageInput);
  }
} 