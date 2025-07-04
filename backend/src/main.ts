import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    });
    
    // Configure Express to trust proxy for IP address detection
    app.getHttpAdapter().getInstance().set('trust proxy', true);
    
    // Enable CORS with specific configuration
    app.enableCors({
      origin: true, // Allow all origins for now
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type,Accept,Authorization',
    });
    
    // Enable proper shutdown hooks
    app.enableShutdownHooks();
    
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`GraphQL Playground available at: ${await app.getUrl()}/graphql`);
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('Unhandled bootstrap error:', err);
  process.exit(1);
});
