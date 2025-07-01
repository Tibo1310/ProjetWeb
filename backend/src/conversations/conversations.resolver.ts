import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ConversationsService } from './conversations.service';
import { Conversation } from './models/conversation.model';
import { CreateConversationInput } from './dto/create-conversation.input';
import { Message } from '../messages/models/message.model';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService,
  ) {}

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

  @ResolveField('participants', () => [User])
  async getParticipants(@Parent() conversation: Conversation): Promise<User[]> {
    return Promise.all(
      conversation.participants.map(participant => 
        this.usersService.findOne(participant.id)
      )
    );
  }
} 