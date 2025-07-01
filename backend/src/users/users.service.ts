import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './models/user.model';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    
    const user: User = {
      id: Date.now().toString(),
      email: createUserInput.email,
      password: hashedPassword,
      username: createUserInput.username,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOnline: false,
      conversationIds: [],
    };

    this.users.push(user);
    await this.cacheManager.set(`user:${user.id}`, user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findOne(id: string): Promise<User> {
    const cachedUser = await this.cacheManager.get<User>(`user:${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.cacheManager.set(`user:${id}`, user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const cachedUser = await this.cacheManager.get<User>(`user:email:${email}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = this.users.find(user => user.email === email);
    if (user) {
      await this.cacheManager.set(`user:email:${email}`, user);
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async setOnlineStatus(id: string, isOnline: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.isOnline = isOnline;
    await this.cacheManager.set(`user:${id}`, user);
    return user;
  }

  async addConversation(userId: string, conversationId: string): Promise<User> {
    const user = await this.findOne(userId);
    if (!user.conversationIds) {
      user.conversationIds = [];
    }
    user.conversationIds.push(conversationId);
    await this.cacheManager.set(`user:${userId}`, user);
    return user;
  }
}