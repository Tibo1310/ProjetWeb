import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { ConversationsService } from './conversations.service';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { CreateConversationInput } from './dto/create-conversation.input';
import { SendMessageInput } from './dto/send-message.input';

const pubSub = new PubSub();

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Query(() => [Conversation])
  async conversations(): Promise<Conversation[]> {
    return this.conversationsService.findAll();
  }

  @Query(() => Conversation)
  async conversation(@Args('id') id: string): Promise<Conversation> {
    return this.conversationsService.findOne(id);
  }

  @Query(() => [Conversation])
  async userConversations(@Args('userId') userId: string): Promise<Conversation[]> {
    return this.conversationsService.findUserConversations(userId);
  }

  @Mutation(() => Conversation)
  async createConversation(
    @Args('createConversationInput') createConversationInput: CreateConversationInput,
  ): Promise<Conversation> {
    return this.conversationsService.create(createConversationInput);
  }

  @Mutation(() => Message)
  async sendMessage(
    @Args('sendMessageInput') sendMessageInput: SendMessageInput,
  ): Promise<Message> {
    const message = await this.conversationsService.addMessage(sendMessageInput);
    pubSub.publish('messageAdded', { messageAdded: message });
    return message;
  }

  @Subscription(() => Message)
  messageAdded() {
    return pubSub.asyncIterator('messageAdded');
  }
} 