import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: 60 * 60 * 1000, // 1 hour
      max: 100, // maximum number of items in cache
      isGlobal: true,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {} 