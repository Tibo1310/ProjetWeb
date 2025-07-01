import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => ID)
  senderId: string;

  @Field(() => ID)
  conversationId: string;

  @Field()
  createdAt: Date;
} 