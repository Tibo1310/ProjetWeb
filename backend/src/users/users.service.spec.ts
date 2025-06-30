import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
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
    it('should create a new user', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      const user = await service.create(createUserInput);

      expect(user).toMatchObject({
        ...createUserInput,
        id: expect.any(Number),
        createdAt: expect.any(Date),
        lastSeen: expect.any(Date),
        isOnline: true,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };
      const createdUser = await service.create(createUserInput);
      
      const foundUser = await service.findOne(createdUser.id);
      
      expect(foundUser).toEqual(createdUser);
    });

    it('should return undefined for non-existent user', async () => {
      const foundUser = await service.findOne(999);
      expect(foundUser).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };
      const createdUser = await service.create(createUserInput);
      
      const foundUser = await service.findByEmail(createUserInput.email);
      
      expect(foundUser).toEqual(createdUser);
    });

    it('should return undefined for non-existent email', async () => {
      const foundUser = await service.findByEmail('nonexistent@example.com');
      expect(foundUser).toBeUndefined();
    });
  });

  describe('updateLastSeen', () => {
    it('should update user lastSeen timestamp', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };
      const createdUser = await service.create(createUserInput);
      const originalLastSeen = createdUser.lastSeen;
      
      await new Promise(resolve => setTimeout(resolve, 1)); // Wait 1ms
      const updatedUser = await service.updateLastSeen(createdUser.id);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.lastSeen.getTime()).toBeGreaterThan(originalLastSeen.getTime());
    });
  });

  describe('setOnlineStatus', () => {
    it('should update user online status', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };
      const createdUser = await service.create(createUserInput);
      
      const updatedUser = await service.setOnlineStatus(createdUser.id, false);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.isOnline).toBeFalsy();
    });
  });
}); 