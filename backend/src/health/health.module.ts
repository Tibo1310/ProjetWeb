import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HealthController } from './health.controller';
import { HealthProcessor } from './health.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'health-queue',
    }),
  ],
  controllers: [HealthController],
  providers: [HealthProcessor],
})
export class HealthModule {} 