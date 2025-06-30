import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Message {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => Int)
  senderId: number;

  @Field(() => User)
  sender: User;

  @Field(() => Int)
  conversationId: number;

  @Field()
  timestamp: Date;

  @Field()
  isRead: boolean;

  @Field(() => [Int])
  readBy: number[];

  @Field(() => String, { nullable: true })
  attachmentUrl?: string;

  @Field(() => String, { nullable: true })
  attachmentType?: string;
} 