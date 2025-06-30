import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateConversationInput {
  @Field()
  @IsString()
  @MinLength(1)
  name: string;

  @Field(() => [ID])
  @IsArray()
  participantIds: string[];

  @Field(() => Boolean)
  @IsBoolean()
  isGroup: boolean;
} 