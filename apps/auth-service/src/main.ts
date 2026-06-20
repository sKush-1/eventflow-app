import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { SERVICES_PORTS } from '@app/common';


async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  await app.listen(SERVICES_PORTS.AUTH_SERVICE ?? 3001);
}
bootstrap();
