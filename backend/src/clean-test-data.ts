import { DataSource } from 'typeorm';
import { User } from './users/models/user.entity';

async function cleanTestData() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'chat_db',
    entities: [User],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');

    const userRepository = dataSource.getRepository(User);
    
    // Supprimer les utilisateurs de test d'Artillery
    const testUsers = await userRepository
      .createQueryBuilder()
      .where('email LIKE :pattern1', { pattern1: '%@test.com' })
      .orWhere('username LIKE :pattern2', { pattern2: 'sender_%' })
      .orWhere('username LIKE :pattern3', { pattern3: 'receiver_%' })
      .getMany();

    console.log(`Found ${testUsers.length} test users to delete`);

    if (testUsers.length > 0) {
      // Nettoyer les conversations des utilisateurs réguliers qui pourraient contenir ces IDs de test
      const regularUsers = await userRepository
        .createQueryBuilder()
        .where('email NOT LIKE :pattern1', { pattern1: '%@test.com' })
        .andWhere('username NOT LIKE :pattern2', { pattern2: 'sender_%' })
        .andWhere('username NOT LIKE :pattern3', { pattern3: 'receiver_%' })
        .getMany();

      for (const user of regularUsers) {
        if (user.conversationIds && user.conversationIds.length > 0) {
          // Filtrer les conversationIds qui ressemblent à des timestamps (13 chiffres)
          const cleanConversationIds = user.conversationIds.filter(id => {
            // Garder seulement les UUIDs valides (format standard)
            return !/^\d{13}$/.test(id) && id.includes('-');
          });
          
          if (cleanConversationIds.length !== user.conversationIds.length) {
            user.conversationIds = cleanConversationIds;
            await userRepository.save(user);
            console.log(`Cleaned conversation IDs for user ${user.username}`);
          }
        }
      }

      // Supprimer les utilisateurs de test
      await userRepository.remove(testUsers);
      console.log(`Deleted ${testUsers.length} test users`);
    }

    console.log('Database cleanup completed successfully');
  } catch (error) {
    console.error('Error cleaning test data:', error);
  } finally {
    await dataSource.destroy();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  cleanTestData().then(() => {
    console.log('Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
} 