import { Injectable, NotFoundException, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput, LoginInput } from './dto/create-user.input';
import { User } from './models/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cacheService: CacheService
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    // Vérifier le cache en premier
    const cachedUser = await this.cacheService.getCachedUser(id);
    if (cachedUser) {
      this.logger.debug(`User ${id} found in cache`);
      return cachedUser;
    }

    // Sinon, chercher en base de données
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Mettre en cache pour les prochaines requêtes
    await this.cacheService.cacheUser(id, user);
    this.logger.debug(`User ${id} cached from database`);
    
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existingUser = await this.findByEmail(createUserInput.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    const user = this.usersRepository.create({
      ...createUserInput,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async login(loginInput: LoginInput): Promise<{ token: string; user: User }> {
    const user = await this.findByEmail(loginInput.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginInput.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = uuidv4();

    return {
      token,
      user: {
        ...user,
        password: undefined,
      } as User,
    };
  }

  async setOnlineStatus(id: string, isOnline: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.isOnline = isOnline;
    const updatedUser = await this.usersRepository.save(user);
    
    // Invalider le cache car l'utilisateur a été modifié
    await this.cacheService.del(this.cacheService.getUserKey(id));
    this.logger.debug(`Cache invalidated for user ${id} after status update`);
    
    return updatedUser;
  }

  async addConversation(userId: string, conversationId: string): Promise<User> {
    const user = await this.findOne(userId);
    if (!user.conversationIds) {
      user.conversationIds = [];
    }
    user.conversationIds.push(conversationId);
    const updatedUser = await this.usersRepository.save(user);
    
    // Invalider le cache car l'utilisateur a été modifié
    await this.cacheService.del(this.cacheService.getUserKey(userId));
    this.logger.debug(`Cache invalidated for user ${userId} after conversation added`);
    
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    return true;
  }
}