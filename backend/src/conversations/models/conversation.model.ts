import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Message } from './message.model';

@ObjectType()
export class Conversation {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [User])
  participants: User[];

  @Field(() => [Message])
  messages: Message[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Boolean)
  isGroup: boolean;

  @Field(() => User, { nullable: true })
  lastMessageSentBy?: User;

  @Field({ nullable: true })
  lastMessageSentAt?: Date;
} 