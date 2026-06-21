import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { SERVICE_PORTS } from '@app/common';



async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  await app.listen(SERVICE_PORTS.AUTH_SERVICE ?? 3001);
}
bootstrap();
