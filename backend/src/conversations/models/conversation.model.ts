import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Message } from './message.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Conversation {
  @Field(() => ID)
  id: string;

  @Field(() => [String])
  participantIds: string[];

  @Field(() => [User])
  participants: User[];

  @Field(() => [Message])
  messages: Message[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 