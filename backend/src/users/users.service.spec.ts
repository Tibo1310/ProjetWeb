import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
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
      const createUserInput: CreateUserInput = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const createdUser = await service.create(createUserInput);
      const foundUser = await service.findOne(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const createUserInput: CreateUserInput = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const createdUser = await service.create(createUserInput);
      const foundUser = await service.findByEmail(createdUser.email);

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(createdUser.email);
    });

    it('should throw NotFoundException when email not found', async () => {
      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setOnlineStatus', () => {
    it('should update user online status', async () => {
      const createUserInput: CreateUserInput = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await service.create(createUserInput);
      const updatedUser = await service.setOnlineStatus(user.id, false);

      expect(updatedUser.isOnline).toBe(false);
    });
  });

  describe('addConversation', () => {
    it('should add conversation to user', async () => {
      const createUserInput: CreateUserInput = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await service.create(createUserInput);
      const updatedUser = await service.addConversation(user.id, 'conv-123');

      expect(updatedUser.conversationIds).toContain('conv-123');
    });
  });
}); 