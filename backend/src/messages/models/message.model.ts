import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Conversation } from '../../conversations/models/conversation.model';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  sender: User;

  @Field(() => Conversation)
  conversation: Conversation;

  @Field()
  createdAt: Date;

  @Field(() => Boolean)
  isRead: boolean;
} 