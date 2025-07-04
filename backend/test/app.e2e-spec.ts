import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { DataSource } from 'typeorm';
import { CacheService } from '../src/cache/cache.service';
import { RabbitMQService } from '../src/rabbitmq/rabbitmq.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let cacheService: CacheService;
  let rabbitMQService: RabbitMQService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TestAppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get services for cleanup and testing
    dataSource = app.get(DataSource);
    cacheService = app.get(CacheService);
    rabbitMQService = app.get(RabbitMQService);

    // Clean database and cache before each test
    await dataSource.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
    await cacheService.reset();
  }, 30000); // 30 seconds timeout

  afterAll(async () => {
    try {
      // Clean cache
      if (cacheService) {
        await cacheService.reset();
      }

      // Close database connections
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }

      // Close the application
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  }, 10000);

  const createUserMutation = `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(createUserInput: $input) {
        id
        username
        email
        isOnline
      }
    }
  `;

  const createConversationMutation = `
    mutation CreateConversation($input: CreateConversationInput!) {
      createConversation(createConversationInput: $input) {
        id
        name
        participants {
          id
          username
        }
      }
    }
  `;

  const sendMessageMutation = `
    mutation SendMessage($input: SendMessageInput!) {
      sendMessage(sendMessageInput: $input) {
        id
        content
        senderId
      }
    }
  `;

  describe('User Management', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createUserMutation,
          variables: {
            input: {
              username: 'testuser',
              email: 'test@example.com',
              password: 'password123',
            },
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createUser).toBeDefined();
          expect(res.body.data.createUser.username).toBe('testuser');
          expect(res.body.data.createUser.email).toBe('test@example.com');
        });
    });
  });

  describe('Conversation Management', () => {
    let user1Id: string;
    let user2Id: string;

    beforeEach(async () => {
      // Create two users for testing
      const user1Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createUserMutation,
          variables: {
            input: {
              username: 'user1',
              email: 'user1@example.com',
              password: 'password123',
            },
          },
        });
      user1Id = user1Response.body.data.createUser.id;

      const user2Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createUserMutation,
          variables: {
            input: {
              username: 'user2',
              email: 'user2@example.com',
              password: 'password123',
            },
          },
        });
      user2Id = user2Response.body.data.createUser.id;
    });

    it('should create a conversation between two users', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createConversationMutation,
          variables: {
            input: {
              participantIds: [user1Id, user2Id],
              name: 'Test Conversation',
            },
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createConversation).toBeDefined();
          expect(res.body.data.createConversation.name).toBe('Test Conversation');
          expect(res.body.data.createConversation.participants).toHaveLength(2);
        });
    });
  });

  describe('Message Management', () => {
    let userId: string;
    let conversationId: string;

    beforeEach(async () => {
      // Create a user
      const userResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createUserMutation,
          variables: {
            input: {
              username: 'messageuser',
              email: 'messageuser@example.com',
              password: 'password123',
            },
          },
        });
      userId = userResponse.body.data.createUser.id;

      // Create a conversation
      const convResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createConversationMutation,
          variables: {
            input: {
              participantIds: [userId],
              name: 'Message Test Conversation',
            },
          },
        });
      conversationId = convResponse.body.data.createConversation.id;
    });

    it('should send a message in a conversation', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: sendMessageMutation,
          variables: {
            input: {
              content: 'Hello, World!',
              conversationId,
              senderId: userId,
            },
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.sendMessage).toBeDefined();
          expect(res.body.data.sendMessage.content).toBe('Hello, World!');
          expect(res.body.data.sendMessage.senderId).toBe(userId);
        });
    });

    it('should call RabbitMQ service when sending a message (Integration Test)', async () => {
      // Spy sur la méthode sendMessage de RabbitMQ
      const rabbitMQSpy = jest.spyOn(rabbitMQService, 'sendMessage').mockResolvedValue(undefined);

      // Envoyer un message via GraphQL
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: sendMessageMutation,
          variables: {
            input: {
              content: 'Integration test message',
              conversationId,
              senderId: userId,
            },
          },
        })
        .expect(200);

      // Vérifier que le message a été créé
      expect(response.body.data.sendMessage).toBeDefined();
      expect(response.body.data.sendMessage.content).toBe('Integration test message');

      // 🎯 TEST D'INTÉGRATION : Vérifier que RabbitMQ a été appelé
      expect(rabbitMQSpy).toHaveBeenCalledTimes(1);
      expect(rabbitMQSpy).toHaveBeenCalledWith(
        'chat.message.created',
        expect.objectContaining({
          content: 'Integration test message',
          senderId: userId,
          conversationId: conversationId,
          id: expect.any(String),
          createdAt: expect.any(Date),
        })
      );

      // Nettoyer le spy
      rabbitMQSpy.mockRestore();
    });
  });
});
