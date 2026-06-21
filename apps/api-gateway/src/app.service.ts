import { SERVICE_PORTS } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `API Gateway service is up and running on port ${SERVICE_PORTS.API_GATEWAY}`;
  }
}
