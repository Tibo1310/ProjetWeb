import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SendMessageInput {
  @Field()
  content: string;

  @Field()
  senderId: string;

  @Field()
  conversationId: string;
} 