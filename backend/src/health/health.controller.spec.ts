import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockQueue: jest.Mocked<any>;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockImplementation((jobName, data, options) => {
        return Promise.resolve({
          id: 'mock-job-id',
          data,
          opts: options,
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: getQueueToken('health-queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should add a health check job to the queue and return status', async () => {
      const result = await controller.checkHealth();

      expect(result).toEqual({
        status: 'OK',
        jobId: 'mock-job-id',
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'health-check-job',
        {
          timestamp: expect.any(Date),
          message: 'Health check performed',
        },
        {
          removeOnComplete: true,
        },
      );
    });
  });
}); 