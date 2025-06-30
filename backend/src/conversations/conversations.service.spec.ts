import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { ConversationsService } from './conversations.service';
import { UsersService } from '../users/users.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { SendMessageInput } from './dto/send-message.input';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let usersService: jest.Mocked<UsersService>;
  let mockQueue: jest.Mocked<any>;

  const mockUser1 = {
    id: 1,
    email: 'test1@example.com',
    username: 'testuser1',
    password: 'password123',
    createdAt: new Date(),
    lastSeen: new Date(),
    isOnline: true,
  };

  const mockUser2 = {
    id: 2,
    email: 'test2@example.com',
    username: 'testuser2',
    password: 'password123',
    createdAt: new Date(),
    lastSeen: new Date(),
    isOnline: true,
  };

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn(),
    };

    const mockUsersService = {
      findOne: jest.fn().mockImplementation((id) => {
        if (id === 1) return mockUser1;
        if (id === 2) return mockUser2;
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: getQueueToken('messages'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const createConversationInput: CreateConversationInput = {
        name: 'Test Conversation',
        participantIds: [1, 2],
      };

      const conversation = await service.createConversation(createConversationInput);

      expect(conversation).toMatchObject({
        name: createConversationInput.name,
        participants: createConversationInput.participantIds,
        messages: [],
        isGroup: false,
        id: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should mark conversation as group when more than 2 participants', async () => {
      const createConversationInput: CreateConversationInput = {
        name: 'Group Chat',
        participantIds: [1, 2, 3],
      };

      const conversation = await service.createConversation(createConversationInput);

      expect(conversation.isGroup).toBeTruthy();
    });
  });

  describe('sendMessage', () => {
    it('should create and return a new message', async () => {
      const sendMessageInput: SendMessageInput = {
        content: 'Hello!',
        senderId: 1,
        conversationId: 1,
      };

      // Create a conversation first
      await service.createConversation({
        name: 'Test Conversation',
        participantIds: [1, 2],
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