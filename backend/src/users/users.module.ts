import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {} 