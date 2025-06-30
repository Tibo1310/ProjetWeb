import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsString, IsUrl, MinLength } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field(() => Int)
  conversationId: number;

  @Field()
  @IsString()
  @MinLength(1)
  content: string;

  @Field(() => String, { nullable: true })
  @IsUrl()
  attachmentUrl?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  attachmentType?: string;

  @Field(() => Int)
  senderId: number;
} 