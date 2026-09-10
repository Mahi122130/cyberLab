import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =========================================================
  // API PREFIX
  // =========================================================

  app.setGlobalPrefix('api/v1');

  // =========================================================
  // CORS
  // =========================================================

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
    ],
    credentials: true,
  });

  // =========================================================
  // PORT
  // =========================================================

  const port = Number(process.env.PORT) || 5001;

  await app.listen(port);

  console.log('');
  console.log('======================================');
  console.log('       CYBERLAB API STARTED');
  console.log('======================================');
  console.log(`API:    http://localhost:${port}/api/v1`);
  console.log(`Labs:   http://localhost:${port}/api/v1/labs`);
  console.log(`Users:  http://localhost:${port}/api/v1/users`);
  console.log('======================================');
  console.log('');
}

bootstrap();