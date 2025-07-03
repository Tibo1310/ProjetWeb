import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { ConversationsService } from './conversations.service';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { CreateConversationInput } from './dto/create-conversation.input';
import { UpdateConversationInput } from './dto/update-conversation.input';
import { SendMessageInput } from './dto/send-message.input';
import { Logger } from '@nestjs/common';

const pubSub = new PubSub();

@Resolver(() => Conversation)
export class ConversationsResolver {
  private readonly logger = new Logger(ConversationsResolver.name);
  
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

  @Mutation(() => Conversation)
  async updateConversation(
    @Args('updateConversationInput') updateConversationInput: UpdateConversationInput,
  ): Promise<Conversation> {
    this.logger.debug(`Updating conversation: ${JSON.stringify(updateConversationInput)}`);
    try {
      const result = await this.conversationsService.update(updateConversationInput);
      this.logger.debug(`Update result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating conversation: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  async deleteConversation(@Args('id') id: string): Promise<boolean> {
    return this.conversationsService.delete(id);
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