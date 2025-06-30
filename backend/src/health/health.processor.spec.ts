import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bull';
import { HealthProcessor } from './health.processor';

describe('HealthProcessor', () => {
  let processor: HealthProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthProcessor],
    }).compile();

    processor = module.get<HealthProcessor>(HealthProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleHealthCheck', () => {
    it('should process health check job and return result', async () => {
      const mockJob = {
        id: 'test-job-id',
        data: {
          timestamp: new Date(),
          message: 'Test health check',
        },
      } as Job;

      const result = await processor.handleHealthCheck(mockJob);

      expect(result).toEqual({
        processed: true,
        jobId: 'test-job-id',
        timestamp: expect.any(Date),
      });
    });

    it('should handle job with minimum delay', async () => {
      const mockJob = {
        id: 'test-job-id',
        data: {
          timestamp: new Date(),
          message: 'Test health check',
        },
      } as Job;

      const startTime = Date.now();
      await processor.handleHealthCheck(mockJob);
      const endTime = Date.now();

      // Verify that the job took at least 100ms (the configured delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });
}); 