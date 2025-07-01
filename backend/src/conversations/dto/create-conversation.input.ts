import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

@InputType()
export class CreateConversationInput {
  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  participantIds: string[];

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  title?: string;
} 