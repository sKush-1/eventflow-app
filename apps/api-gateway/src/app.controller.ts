import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('register')
  async register(@Body() body: any, @Res() res: Response) {
    const authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
    try {
      const response = await fetch(`${authServiceUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error: any) {
      return res.status(500).json({
        message: 'Internal Gateway Error: Failed to connect to auth-service',
        error: error.message,
      });
    }
  }
}
