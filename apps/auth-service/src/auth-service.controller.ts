import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) { }


  @Post('register')
  async register(@Body() body: { email: string, password: string, name: string }) {
    return this.authServiceService.register(body.email, body.password, body.name);
  }

  @Post('login')
  async login(@Body() body: { email: string, password: string }) {
    return this.authServiceService.login(body.email, body.password);
  }

  @Get('profile')
  getProfile(@Request() req: { user: { userId: string } }) {
    return this.authServiceService.getProfile(req.user.userId);
  }
}
