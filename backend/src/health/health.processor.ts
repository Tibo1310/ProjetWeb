import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

interface HealthCheckJobData {
  timestamp: Date;
  message: string;
}

@Processor('health-queue')
export class HealthProcessor {
  private readonly logger = new Logger(HealthProcessor.name);

  @Process('health-check-job')
  async handleHealthCheck(job: Job<HealthCheckJobData>) {
    this.logger.log('=== Processing health check job ===');
    this.logger.log(`Job ID: ${job.id}`);
    this.logger.log(`Timestamp: ${job.data.timestamp.toISOString()}`);
    this.logger.log(`Message: ${job.data.message}`);
    this.logger.log('=== Job processing completed ===');

    await new Promise((resolve) => setTimeout(resolve, 100)); // Add a small delay to make the async meaningful

    return {
      processed: true,
      jobId: job.id,
      timestamp: new Date(),
    };
  }
} 