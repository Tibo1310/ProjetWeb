import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { RedisCacheModule } from '../cache/cache.module';

@Module({
  imports: [RedisCacheModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {} 