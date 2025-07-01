import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Message } from './message.model';
import { User } from '../../users/models/user.entity';

@ObjectType()
export class Conversation {
  @Field()
  id: string;

  @Field(() => [String])
  participantIds: string[];

  @Field(() => [User])
  participants: User[];

  @Field(() => [Message])
  messages: Message[];

  @Field()
  name: string;

  @Field()
  isGroup: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 