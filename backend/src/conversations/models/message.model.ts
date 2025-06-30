import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  sender: User;

  @Field(() => ID)
  conversationId: string;

  @Field()
  createdAt: Date;

  @Field(() => Boolean)
  isRead: boolean;

  @Field(() => [User])
  readBy: User[];

  @Field(() => String, { nullable: true })
  attachmentUrl?: string;

  @Field(() => String, { nullable: true })
  attachmentType?: string;
} 