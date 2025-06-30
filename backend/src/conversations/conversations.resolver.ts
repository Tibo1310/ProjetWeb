import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { ConversationsService } from './conversations.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { SendMessageInput } from './dto/send-message.input';

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Query(() => [Conversation])
  async userConversations(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Conversation[]> {
    return this.conversationsService.findUserConversations(userId);
  }

  @Query(() => Conversation, { nullable: true })
  async conversation(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Conversation | undefined> {
    return this.conversationsService.findOne(id);
  }

  @ResolveField(() => [Message])
  async messages(@Parent() conversation: Conversation): Promise<Message[]> {
    return conversation.messages;
  }

  @Mutation(() => Conversation)
  async createConversation(
    @Args('input') input: CreateConversationInput,
  ): Promise<Conversation> {
    return this.conversationsService.create(input);
  }

  @Mutation(() => Message)
  async sendMessage(
    @Args('senderId', { type: () => ID }) senderId: string,
    @Args('input') input: SendMessageInput,
  ): Promise<Message> {
    return this.conversationsService.sendMessage(senderId, input);
  }
} 