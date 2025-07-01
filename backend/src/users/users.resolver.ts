import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.entity';
import { CreateUserInput, LoginInput } from './dto/create-user.input';
import { AuthResponse } from './models/auth.model';
import { Logger } from '@nestjs/common';

@Resolver(() => User)
export class UsersResolver {
  private readonly logger = new Logger(UsersResolver.name);

  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  async user(@Args('id') id: string): Promise<User> {
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
} 