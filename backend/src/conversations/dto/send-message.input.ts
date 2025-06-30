import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsUrl, MinLength } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field(() => ID)
  conversationId: string;

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
} 