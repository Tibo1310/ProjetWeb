import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UsersLoader } from './users.loader';
import { User } from './models/user.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule,
  ],
  providers: [UsersService, UsersResolver, UsersLoader],
  exports: [UsersService, UsersLoader],
})
export class UsersModule {} 