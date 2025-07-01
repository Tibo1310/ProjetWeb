import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

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
        title
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
        sender {
          id
          username
        }
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
              title: 'Test Conversation',
            },
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createConversation).toBeDefined();
          expect(res.body.data.createConversation.title).toBe('Test Conversation');
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
              title: 'Message Test Conversation',
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
          expect(res.body.data.sendMessage.sender.id).toBe(userId);
        });
    });
  });
});
