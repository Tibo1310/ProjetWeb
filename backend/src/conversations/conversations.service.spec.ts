import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { ConversationsService } from './conversations.service';
import { UsersService } from '../users/users.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { SendMessageInput } from './dto/send-message.input';
import { NotFoundException } from '@nestjs/common';
import { User } from '../users/models/user.model';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let usersService: UsersService;
  let mockQueue: jest.Mocked<any>;

  const mockUser1: User = {
    id: '1',
    username: 'user1',
    email: 'user1@example.com',
    createdAt: new Date(),
    isOnline: true,
    conversationIds: [],
  };

  const mockUser2: User = {
    id: '2',
    username: 'user2',
    email: 'user2@example.com',
    createdAt: new Date(),
    isOnline: true,
    conversationIds: [],
  };

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockImplementation((id: string) => {
              if (id === '1') return Promise.resolve(mockUser1);
              if (id === '2') return Promise.resolve(mockUser2);
              return Promise.reject(new NotFoundException());
            }),
            addConversation: jest.fn().mockImplementation((userId: string, convId: string) => {
              const user = userId === '1' ? mockUser1 : mockUser2;
              user.conversationIds.push(convId);
              return Promise.resolve(user);
            }),
          },
        },
        {
          provide: getQueueToken('messages'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const createConversationInput: CreateConversationInput = {
        participantIds: ['1', '2'],
        title: 'Test Conversation',
      };

      const conversation = await service.create(createConversationInput);

      expect(conversation).toBeDefined();
      expect(conversation.participants).toHaveLength(2);
      expect(conversation.participants).toContainEqual(mockUser1);
      expect(conversation.participants).toContainEqual(mockUser2);
      expect(conversation.title).toBe(createConversationInput.title);
      expect(conversation.messages).toEqual([]);
    });

    it('should throw NotFoundException for invalid participant', async () => {
      const createConversationInput: CreateConversationInput = {
        participantIds: ['1', 'invalid-id'],
        title: 'Test Conversation',
      };

      await expect(service.create(createConversationInput)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a conversation by id', async () => {
      const createConversationInput: CreateConversationInput = {
        participantIds: ['1', '2'],
        title: 'Test Conversation',
      };

      const createdConversation = await service.create(createConversationInput);
      const foundConversation = await service.findOne(createdConversation.id);

      expect(foundConversation).toBeDefined();
      expect(foundConversation.id).toBe(createdConversation.id);
    });

    it('should throw NotFoundException when conversation not found', async () => {
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserConversations', () => {
    it('should find all conversations for a user', async () => {
      const createConversationInput: CreateConversationInput = {
        participantIds: ['1', '2'],
        title: 'Test Conversation',
      };

      await service.create(createConversationInput);
      const userConversations = await service.findUserConversations('1');

      expect(userConversations).toHaveLength(1);
      expect(userConversations[0].participants).toContainEqual(mockUser1);
    });

    it('should return empty array when user has no conversations', async () => {
      const userConversations = await service.findUserConversations('3');
      expect(userConversations).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    it('should create and return a new message', async () => {
      const sendMessageInput: SendMessageInput = {
        content: 'Hello!',
        senderId: '1',
        conversationId: '1',
      };

      // Create a conversation first
      await service.create({
        participantIds: ['1', '2'],
        title: 'Test Conversation',
      });

      const message = await service.sendMessage(sendMessageInput);

      expect(message).toMatchObject({
        content: sendMessageInput.content,
        senderId: sendMessageInput.senderId,
        conversationId: sendMessageInput.conversationId,
        sender: mockUser1,
        id: expect.any(Number),
        timestamp: expect.any(Date),
        isRead: false,
        readBy: [],
      });
    });

    it('should throw error when sender not found', async () => {
      const sendMessageInput: SendMessageInput = {
        content: 'Hello!',
        senderId: 999, // Non-existent user
        conversationId: 1,
      };

      await expect(service.sendMessage(sendMessageInput)).rejects.toThrow('Sender not found');
    });
  });

  describe('queueMessage', () => {
    it('should add message to queue', async () => {
      const sendMessageInput: SendMessageInput = {
        content: 'Hello!',
        senderId: 1,
        conversationId: 1,
      };

      await service.queueMessage(sendMessageInput);

      expect(mockQueue.add).toHaveBeenCalledWith('saveMessage', sendMessageInput);
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark message as read for user', async () => {
      // Create conversation and send message
      const conversation = await service.createConversation({
        name: 'Test Conversation',
        participantIds: [1, 2],
      });

      const message = await service.sendMessage({
        content: 'Hello!',
        senderId: 1,
        conversationId: conversation.id,
      });

      const updatedMessage = await service.markMessageAsRead(message.id, 2);

      expect(updatedMessage).toBeDefined();
      expect(updatedMessage?.readBy).toBeDefined();
      expect(updatedMessage?.readBy).toContain(2);
    });

    it('should not mark message as read for same user twice', async () => {
      // Create conversation and send message
      const conversation = await service.createConversation({
        name: 'Test Conversation',
        participantIds: [1, 2],
      });

      const message = await service.sendMessage({
        content: 'Hello!',
        senderId: 1,
        conversationId: conversation.id,
      });

      await service.markMessageAsRead(message.id, 2);
      const updatedMessage = await service.markMessageAsRead(message.id, 2);

      expect(updatedMessage).toBeDefined();
      expect(updatedMessage?.readBy).toBeDefined();
      expect(updatedMessage?.readBy.filter(id => id === 2)).toHaveLength(1);
    });
  });
}); 