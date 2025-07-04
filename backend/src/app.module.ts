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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate Limiting - Protection contre les abus
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 seconde
        limit: 20,  // 20 requêtes par seconde (augmenté pour les perfs)
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 200, // 200 requêtes par minute
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 1000, // 1000 requêtes par 15 minutes
      }
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'chat_db',
      entities: [User],
      synchronize: true, // Ne pas utiliser en production
      logging: process.env.NODE_ENV === 'development',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      playground: process.env.NODE_ENV === 'development',
      introspection: process.env.NODE_ENV === 'development',
      path: '/graphql',
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          // En production, masquer les détails sensibles
          ...(process.env.NODE_ENV === 'development' && {
            locations: error.locations,
            path: error.path,
            extensions: error.extensions,
          }),
        };
      },
      context: ({ req, res }) => ({ req, res }),
      // Optimisations de performance
      plugins: [],
      // Limites de sécurité
      validationRules: [],
    }),
    CacheModule,
    UsersModule,
    ConversationsModule,
    GraphQLStatusModule,
    RabbitMQModule,
  ],
  providers: [
    // Rate limiting global (désactivé temporairement à cause de problèmes avec GraphQL)
    // ...(process.env.NODE_ENV !== 'test' ? [{
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // }] : []),
  ],
})
export class AppModule {} 