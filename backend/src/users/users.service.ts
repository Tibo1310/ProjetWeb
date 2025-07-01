import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.input';
import * as bcrypt from 'bcrypt';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(private readonly cacheService: CacheService) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    
    const user: User = {
      id: Date.now().toString(),
      username: createUserInput.username,
      email: createUserInput.email,
      createdAt: new Date(),
      isOnline: true,
      conversationIds: [],
    };

    this.users.push(user);
    await this.cacheService.cacheUser(user.id, user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findOne(id: string): Promise<User> {
    // Try to get from cache first
    const cachedUser = await this.cacheService.getCachedUser(id);
    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, get from "database"
    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Cache the user for future requests
    await this.cacheService.cacheUser(id, user);
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.users.find(user => user.email === email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async setOnlineStatus(id: string, isOnline: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.isOnline = isOnline;
    await this.cacheService.cacheUser(id, user);
    return user;
  }

  async addConversation(userId: string, conversationId: string): Promise<User> {
    const user = await this.findOne(userId);
    if (!user.conversationIds) {
      user.conversationIds = [];
    }
    user.conversationIds.push(conversationId);
    await this.cacheService.cacheUser(userId, user);
    return user;
  }
} 
} 