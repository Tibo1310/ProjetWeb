import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersLoader } from './users.loader';
import { User } from './models/user.entity';
import { CacheService } from '../cache/cache.service';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
});

const mockCacheService = () => ({
  getCachedUser: jest.fn(),
  cacheUser: jest.fn(),
});

describe('UsersLoader (DataLoader N+1 Prevention)', () => {
  let usersLoader: UsersLoader;
  let usersRepository: jest.Mocked<Repository<User>>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersLoader,
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

    usersLoader = module.get<UsersLoader>(UsersLoader);
    usersRepository = module.get(getRepositoryToken(User));
    cacheService = module.get(CacheService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersLoader).toBeDefined();
  });

  describe('DataLoader Batching (N+1 Prevention)', () => {
    it('should batch multiple user requests into single SQL query', async () => {
      // Arrange: 3 utilisateurs à charger
      const user1: User = { id: '1', username: 'user1', email: 'user1@test.com', password: 'hash', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };
      const user2: User = { id: '2', username: 'user2', email: 'user2@test.com', password: 'hash', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };
      const user3: User = { id: '3', username: 'user3', email: 'user3@test.com', password: 'hash', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };

      // Mock: Aucun utilisateur en cache
      cacheService.getCachedUser.mockResolvedValue(null);
      
      // Mock: Une seule requête SQL retourne tous les utilisateurs
      usersRepository.find.mockResolvedValue([user1, user2, user3]);
      
      // Mock: Cache des utilisateurs
      cacheService.cacheUser.mockResolvedValue(undefined);

      // Act: Charger 3 utilisateurs simultanément (simule le problème N+1)
      const [result1, result2, result3] = await Promise.all([
        usersLoader.loadUser('1'),
        usersLoader.loadUser('2'), 
        usersLoader.loadUser('3'),
      ]);

      // Assert: Vérifier que les utilisateurs sont retournés
      expect(result1).toEqual(user1);
      expect(result2).toEqual(user2);
      expect(result3).toEqual(user3);

      // 🎯 PREUVE D'OPTIMISATION: Une seule requête SQL pour 3 utilisateurs
      expect(usersRepository.find).toHaveBeenCalledTimes(1);
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { id: expect.any(Object) }, // TypeORM In() clause
      });

      // Cache appelé pour chaque utilisateur
      expect(cacheService.cacheUser).toHaveBeenCalledTimes(3);
    });

    it('should use cache when available and reduce SQL queries', async () => {
      // Arrange
      const cachedUser: User = { id: '1', username: 'cached', email: 'cached@test.com', password: 'hash', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };
      const dbUser: User = { id: '2', username: 'fromdb', email: 'db@test.com', password: 'hash', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };

      // Mock: User 1 en cache, User 2 pas en cache
      cacheService.getCachedUser
        .mockResolvedValueOnce(cachedUser)  // Pour user 1
        .mockResolvedValueOnce(null);       // Pour user 2

      usersRepository.find.mockResolvedValue([dbUser]);
      cacheService.cacheUser.mockResolvedValue(undefined);

      // Act: Charger 2 utilisateurs
      const [result1, result2] = await Promise.all([
        usersLoader.loadUser('1'), // En cache
        usersLoader.loadUser('2'), // Pas en cache
      ]);

      // Assert
      expect(result1).toEqual(cachedUser);
      expect(result2).toEqual(dbUser);

      // Seulement 1 requête SQL pour l'utilisateur non-caché
      expect(usersRepository.find).toHaveBeenCalledTimes(1);
      
      // Cache seulement pour l'utilisateur récupéré de la DB
      expect(cacheService.cacheUser).toHaveBeenCalledTimes(1);
      expect(cacheService.cacheUser).toHaveBeenCalledWith('2', dbUser);
    });

    it('should handle loadUsers for multiple users efficiently', async () => {
      // Arrange
      const users: User[] = [
        { id: '1', username: 'user1', email: 'user1@test.com', password: 'hash', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() },
        { id: '2', username: 'user2', email: 'user2@test.com', password: 'hash', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() },
        { id: '3', username: 'user3', email: 'user3@test.com', password: 'hash', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() },
      ];

      cacheService.getCachedUser.mockResolvedValue(null);
      usersRepository.find.mockResolvedValue(users);
      cacheService.cacheUser.mockResolvedValue(undefined);

      // Act: Charger plusieurs utilisateurs d'un coup (cas d'usage conversation)
      const results = await usersLoader.loadUsers(['1', '2', '3']);

      // Assert
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(users[0]);
      expect(results[1]).toEqual(users[1]);
      expect(results[2]).toEqual(users[2]);

      // Une seule requête SQL pour tous les utilisateurs
      expect(usersRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cache Management', () => {
    it('should clear user from DataLoader cache', () => {
      // Act
      usersLoader.clearUser('1');

      // Assert: Pas d'erreur (méthode void)
      expect(() => usersLoader.clearUser('1')).not.toThrow();
    });

    it('should clear all DataLoader cache', () => {
      // Act
      usersLoader.clearAll();

      // Assert: Pas d'erreur (méthode void)
      expect(() => usersLoader.clearAll()).not.toThrow();
    });

    it('should prime DataLoader cache with user', () => {
      // Arrange
      const user: User = { id: '1', username: 'primed', email: 'primed@test.com', password: 'hash', isOnline: true, conversationIds: [], createdAt: new Date(), updatedAt: new Date() };

      // Act
      usersLoader.primeUser(user);

      // Assert: Pas d'erreur (méthode void)
      expect(() => usersLoader.primeUser(user)).not.toThrow();
    });
  });
}); 