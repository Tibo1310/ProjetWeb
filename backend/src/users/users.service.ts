import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  async create(createUserInput: CreateUserInput): Promise<User> {
    const now = new Date();
    const user: User = {
      id: this.nextId++,
      ...createUserInput,
      createdAt: now,
      lastSeen: now,
      isOnline: true,
    };
    this.users.push(user);
    return user;
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async updateLastSeen(id: number): Promise<User | undefined> {
    const user = await this.findOne(id);
    if (user) {
      user.lastSeen = new Date();
    }
    return user;
  }

  async setOnlineStatus(id: number, isOnline: boolean): Promise<User | undefined> {
    const user = await this.findOne(id);
    if (user) {
      user.isOnline = isOnline;
    }
    return user;
  }
} 