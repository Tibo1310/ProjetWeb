import { Controller, Get } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('health')
export class HealthController {
  constructor(
    @InjectQueue('health-queue') private readonly healthQueue: Queue,
  ) {}

  @Get()
  async checkHealth() {
    // Add a job to the queue
    const job = await this.healthQueue.add(
      'health-check-job',
      {
        timestamp: new Date(),
        message: 'Health check performed',
      },
      {
        removeOnComplete: true, // Remove jobs from queue after completion
      },
    );

    return {
      status: 'OK',
      jobId: job.id,
    };
  }
} 