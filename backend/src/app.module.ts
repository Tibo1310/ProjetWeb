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
      url: process.env.DATABASE_URL,
      entities: [User],
      synchronize: true, // Ne pas utiliser en production
      logging: process.env.NODE_ENV === 'development',
      // Configuration optimisée pour les performances
      extra: {
        max: 20,           // Pool maximum de 20 connexions
        min: 5,            // Pool minimum de 5 connexions
        acquire: 30000,    // Timeout de 30s pour acquérir une connexion
        idle: 10000,       // Timeout de 10s pour une connexion inactive
        evict: 1000,       // Intervalle de vérification des connexions (1s)
        connectionTimeoutMillis: 10000, // Timeout de connexion
        idleTimeoutMillis: 30000,       // Timeout d'inactivité
      },
      // Optimisations de performance
      maxQueryExecutionTime: 5000, // Log des requêtes lentes > 5s
      // Désactiver le cache Redis en mode test
      ...(process.env.NODE_ENV !== 'test' && {
        cache: {
          type: 'redis',
          options: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
          },
          duration: 30000, // Cache TypeORM pendant 30s
        },
      }),
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
    // Rate limiting global (désactivé en test)
    ...(process.env.NODE_ENV !== 'test' ? [{
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }] : []),
  ],
})
export class AppModule {} 