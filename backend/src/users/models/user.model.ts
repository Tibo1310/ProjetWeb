import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field(() => Boolean)
  isOnline: boolean;

  @Field(() => [String], { nullable: true })
  conversationIds?: string[];
} 