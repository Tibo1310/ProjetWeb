import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { ConversationsModule } from './conversations/conversations.module';
import { GraphQLStatusModule } from './graphql/graphql.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      playground: true,
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    CacheModule,
    UsersModule,
    ConversationsModule,
    GraphQLStatusModule,
    RabbitMQModule,
  ],
})
export class AppModule {} 