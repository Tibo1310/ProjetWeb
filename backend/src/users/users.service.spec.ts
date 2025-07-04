import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { Repository } from 'typeorm';
import { CacheService } from '../cache/cache.service';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockCacheService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
  getUserKey: jest.fn(),
  cacheUser: jest.fn(),
  getCachedUser: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<User>>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: CacheService,
          useValue: mockCacheService(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    cacheService = module.get(CacheService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserInput: CreateUserInput = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      usersRepository.findOne.mockResolvedValue(undefined); // Pas d'utilisateur existant
      usersRepository.create.mockReturnValue({
        ...createUserInput,
        id: '1',
        password: 'hashed',
        isOnline: true,
        conversationIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User);
      usersRepository.save.mockImplementation(async (user) => ({
        id: '1',
        username: user.username,
        email: user.email,
        password: user.password,
        isOnline: true,
        conversationIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const user = await service.create(createUserInput);

      expect(user).toBeDefined();
      expect(user.username).toBe(createUserInput.username);
      expect(user.email).toBe(createUserInput.email);
      expect(user.isOnline).toBe(true);
      expect(user.conversationIds).toEqual([]);
      expect(user.id).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const user: User = { id: '1', username: 'testuser', email: 'test@example.com', password: 'hashed', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };
      cacheService.getCachedUser.mockResolvedValue(null); // Pas en cache
      usersRepository.findOne.mockResolvedValue(user);
      cacheService.cacheUser.mockResolvedValue(undefined);
      
      const foundUser = await service.findOne('1');
      
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe('1');
      expect(cacheService.getCachedUser).toHaveBeenCalledWith('1');
      expect(cacheService.cacheUser).toHaveBeenCalledWith('1', user);
    });

    it('should return cached user when available', async () => {
      const user: User = { id: '1', username: 'testuser', email: 'test@example.com', password: 'hashed', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };
      cacheService.getCachedUser.mockResolvedValue(user); // En cache
      
      const foundUser = await service.findOne('1');
      
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe('1');
      expect(cacheService.getCachedUser).toHaveBeenCalledWith('1');
      expect(usersRepository.findOne).not.toHaveBeenCalled(); // Pas d'appel à la DB
    });

    it('should throw NotFoundException when user not found', async () => {
      cacheService.getCachedUser.mockResolvedValue(null);
      usersRepository.findOne.mockResolvedValue(undefined);
      
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user: User = { id: '1', username: 'testuser', email: 'test@example.com', password: 'hashed', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };
      usersRepository.findOne.mockResolvedValue(user);
      const foundUser = await service.findByEmail('test@example.com');
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('test@example.com');
    });

    it('should throw NotFoundException when email not found', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      await expect(service.findByEmail('nonexistent@example.com')).resolves.toBeUndefined();
    });
  });

  describe('setOnlineStatus', () => {
    it('should update user online status', async () => {
      const user: User = { id: '1', username: 'testuser', email: 'test@example.com', password: 'hashed', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };
      cacheService.getCachedUser.mockResolvedValue(null);
      usersRepository.findOne.mockResolvedValue(user);
      cacheService.cacheUser.mockResolvedValue(undefined);
      usersRepository.save.mockImplementation(async (u) => ({
        ...user,
        isOnline: false,
      }));
      cacheService.getUserKey.mockReturnValue('user:1');
      cacheService.del.mockResolvedValue(undefined);
      
      const updatedUser = await service.setOnlineStatus('1', false);
      
      expect(updatedUser.isOnline).toBe(false);
      expect(cacheService.del).toHaveBeenCalledWith('user:1'); // Cache invalidé
    });
  });

  describe('addConversation', () => {
    it('should add conversation to user', async () => {
      const user: User = { id: '1', username: 'testuser', email: 'test@example.com', password: 'hashed', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };
      cacheService.getCachedUser.mockResolvedValue(null);
      usersRepository.findOne.mockResolvedValue(user);
      cacheService.cacheUser.mockResolvedValue(undefined);
      usersRepository.save.mockImplementation(async (u) => ({
        ...user,
        conversationIds: [...user.conversationIds, 'conv-123'],
      }));
      cacheService.getUserKey.mockReturnValue('user:1');
      cacheService.del.mockResolvedValue(undefined);
      
      const updatedUser = await service.addConversation('1', 'conv-123');
      
      expect(updatedUser.conversationIds).toContain('conv-123');
      expect(cacheService.del).toHaveBeenCalledWith('user:1'); // Cache invalidé
    });
  });
}); 