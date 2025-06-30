import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';

@ObjectType()
export class StatusResponse {
  @Field()
  result: string;
}

@Resolver()
export class StatusResolver {
  @Query(() => StatusResponse)
  status(): StatusResponse {
    return {
      result: 'ok',
    };
  }
} 