import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  content: string;

  @Field(() => Int)
  senderId: number;

  @Field(() => Int)
  conversationId: number;
} 