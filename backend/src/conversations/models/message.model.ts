import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field()
  senderId: string;

  @Field()
  conversationId: string;

  @Field()
  createdAt: Date;
} 