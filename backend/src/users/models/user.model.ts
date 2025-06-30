import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field()
  lastSeen: Date;

  @Field()
  isOnline: boolean;

  // Ne pas exposer le mot de passe via GraphQL
  password: string;
} 