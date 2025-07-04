import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import DataLoader from 'dataloader';
import { User } from './models/user.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UsersLoader {
  private readonly logger = new Logger(UsersLoader.name);
  private readonly userLoader: DataLoader<string, User>;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cacheService: CacheService,
  ) {
    // Créer le DataLoader avec batching
    this.userLoader = new DataLoader<string, User>(
      async (userIds: readonly string[]) => {
        return this.batchLoadUsers([...userIds]);
      },
      {
        // Options de configuration
        batch: true,
        cache: true,
        maxBatchSize: 100, // Maximum 100 users par batch
      }
    );
  }

  /**
   * Charge un utilisateur via DataLoader (avec batching automatique)
   */
  async loadUser(id: string): Promise<User> {
    return this.userLoader.load(id);
  }

  /**
   * Charge plusieurs utilisateurs via DataLoader
   */
  async loadUsers(ids: string[]): Promise<User[]> {
    return this.userLoader.loadMany(ids) as Promise<User[]>;
  }

  /**
   * Fonction de batching : charge plusieurs utilisateurs en une seule requête SQL
   */
  private async batchLoadUsers(userIds: string[]): Promise<User[]> {
    this.logger.debug(`Batching ${userIds.length} user queries into 1 SQL query`);

    // 1. Vérifier le cache pour chaque utilisateur
    const cachedUsers: (User | null)[] = [];
    const uncachedIds: string[] = [];

    for (const id of userIds) {
      const cachedUser = await this.cacheService.getCachedUser(id);
      if (cachedUser) {
        cachedUsers[userIds.indexOf(id)] = cachedUser;
        this.logger.debug(`User ${id} found in cache`);
      } else {
        cachedUsers[userIds.indexOf(id)] = null;
        uncachedIds.push(id);
      }
    }

    // 2. Si tous les utilisateurs sont en cache, retourner directement
    if (uncachedIds.length === 0) {
      this.logger.debug(`All ${userIds.length} users found in cache`);
      return cachedUsers as User[];
    }

    // 3. Charger les utilisateurs manquants avec UNE SEULE requête SQL
    this.logger.debug(`Loading ${uncachedIds.length} users from database in single query`);
    const usersFromDb = await this.usersRepository.find({
      where: { id: In(uncachedIds) },
    });

    // 4. Mettre en cache les utilisateurs récupérés
    for (const user of usersFromDb) {
      await this.cacheService.cacheUser(user.id, user);
      this.logger.debug(`User ${user.id} cached from database`);
    }

    // 5. Mapper les résultats dans le bon ordre
    const userMap = new Map<string, User>();
    usersFromDb.forEach(user => userMap.set(user.id, user));

    const result: User[] = [];
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const cachedUser = cachedUsers[i];
      
      if (cachedUser) {
        result.push(cachedUser);
      } else {
        const userFromDb = userMap.get(userId);
        if (userFromDb) {
          result.push(userFromDb);
        } else {
          // Utilisateur non trouvé - DataLoader s'attend à une erreur ou null
          throw new Error(`User with ID ${userId} not found`);
        }
      }
    }

    this.logger.debug(`Batch loading completed: ${result.length} users returned`);
    return result;
  }

  /**
   * Invalide le cache DataLoader pour un utilisateur spécifique
   */
  clearUser(id: string): void {
    this.userLoader.clear(id);
    this.logger.debug(`DataLoader cache cleared for user ${id}`);
  }

  /**
   * Invalide tout le cache DataLoader
   */
  clearAll(): void {
    this.userLoader.clearAll();
    this.logger.debug('DataLoader cache completely cleared');
  }

  /**
   * Prime le cache DataLoader avec un utilisateur (optimisation)
   */
  primeUser(user: User): void {
    this.userLoader.prime(user.id, user);
    this.logger.debug(`DataLoader cache primed for user ${user.id}`);
  }
} 