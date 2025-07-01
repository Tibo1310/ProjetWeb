import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { ConversationsModule } from './conversations/conversations.module';
import { GraphQLStatusModule } from './graphql/graphql.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './cache/cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/models/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User],
      synchronize: true, // Ne pas utiliser en production
      logging: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      playground: true,
      introspection: true,
      path: '/graphql',
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    CacheModule,
    UsersModule,
    ConversationsModule,
    GraphQLStatusModule,
    RabbitMQModule,
  ],
})
export class AppModule {} 