import { InputType, Field, Int } from '@nestjs/graphql';
import { IsArray, IsString } from 'class-validator';

@InputType()
export class CreateConversationInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => [Int])
  @IsArray()
  participantIds: number[];
} 