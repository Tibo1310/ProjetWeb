import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Message } from './message.model';

@ObjectType()
export class Conversation {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => [Int])
  participants: number[];

  @Field(() => [Int])
  messages: number[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  isGroup: boolean;

  @Field(() => User, { nullable: true })
  lastMessageSentBy?: User;

  @Field({ nullable: true })
  lastMessageSentAt?: Date;
} 