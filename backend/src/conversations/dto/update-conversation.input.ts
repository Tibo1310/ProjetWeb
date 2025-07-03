import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class UpdateConversationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsString()
  @MinLength(1)
  name: string;

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  participantIds: string[];
}