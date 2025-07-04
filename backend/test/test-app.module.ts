import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from '../src/users/users.module';
import { ConversationsModule } from '../src/conversations/conversations.module';
import { GraphQLStatusModule } from '../src/graphql/graphql.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '../src/cache/cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/models/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User],
      synchronize: true,
      logging: false, // Désactiver le logging en test
      // Configuration simple pour les tests
      extra: {
        max: 5,
        min: 1,
        acquire: 30000,
        idle: 10000,
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      playground: false,
      introspection: false,
      path: '/graphql',
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          locations: error.locations,
          path: error.path,
          extensions: error.extensions,
        };
      },
      context: ({ req, res }) => ({ req, res }),
      plugins: [],
      validationRules: [],
    }),
    CacheModule,
    UsersModule,
    ConversationsModule,
    GraphQLStatusModule,
    // Note: RabbitMQModule excluded for tests to avoid connection issues
  ],
  // Note: No ThrottlerGuard provider for tests
  providers: [],
})
export class TestAppModule {} 