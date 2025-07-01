import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Message } from '../../messages/models/message.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Conversation {
  @Field(() => ID)
  id: string;

  @Field(() => [User])
  participants: User[];

  @Field(() => [Message])
  messages: Message[];

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  lastMessageAt?: Date;

  @Field(() => String, { nullable: true })
  title?: string;
} 