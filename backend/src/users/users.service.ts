import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UsersService {
  private users: User[] = []; // Temporaire, à remplacer par une base de données

  async create(createUserInput: CreateUserInput): Promise<User> {
    const user: User = {
      id: Date.now().toString(), // Temporaire, à remplacer par un UUID
      ...createUserInput,
      createdAt: new Date(),
      lastSeen: new Date(),
      isOnline: true,
    };

    this.users.push(user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async updateLastSeen(id: string): Promise<User | undefined> {
    const user = await this.findOne(id);
    if (user) {
      user.lastSeen = new Date();
    }
    return user;
  }

  async setOnlineStatus(id: string, isOnline: boolean): Promise<User | undefined> {
    const user = await this.findOne(id);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date();
    }
    return user;
  }
} 