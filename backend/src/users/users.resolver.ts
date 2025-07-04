import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.entity';
import { CreateUserInput, LoginInput } from './dto/create-user.input';
import { AuthResponse } from './models/auth.model';
import { Logger, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Resolver(() => User)
export class UsersResolver {
  private readonly logger = new Logger(UsersResolver.name);

  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache pendant 5 minutes
  async users(): Promise<User[]> {
    this.logger.debug('Fetching all users from database');
    return this.usersService.findAll();
  }

  @Query(() => User)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600) // Cache pendant 10 minutes
  async user(@Args('id') id: string): Promise<User> {
    this.logger.debug(`Fetching user ${id} from database`);
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserInput.email}`);
    return this.usersService.create(createUserInput);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    this.logger.log(`Login attempt for email: ${loginInput.email}`);
    try {
      const result = await this.usersService.login(loginInput);
      this.logger.log(`Login successful for email: ${loginInput.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Login failed for email: ${loginInput.email}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => User)
  async setUserOnlineStatus(
    @Args('id') id: string,
    @Args('isOnline') isOnline: boolean,
  ): Promise<User> {
    return this.usersService.setOnlineStatus(id, isOnline);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    this.logger.log(`Deleting user with id: ${id}`);
    try {
      return await this.usersService.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete user with id: ${id}`, error.stack);
      throw error;
    }
  }
} 