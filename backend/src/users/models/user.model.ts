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

  @Field()
  lastSeen: Date;

  @Field(() => Boolean)
  isOnline: boolean;

  // Ne pas exposer le mot de passe via GraphQL
  password: string;
} 