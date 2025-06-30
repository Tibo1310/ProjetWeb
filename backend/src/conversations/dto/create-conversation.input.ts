import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateConversationInput {
  @Field()
  @IsString()
  @MinLength(1)
  name: string;

  @Field(() => [Int])
  @IsArray()
  participantIds: number[];

  @Field(() => Boolean)
  @IsBoolean()
  isGroup: boolean;
} 