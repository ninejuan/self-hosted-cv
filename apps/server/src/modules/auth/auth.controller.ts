import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TotpCodeDto } from './dto/totp-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(ThrottlerGuard)
  login(
    @Body() dto: LoginDto,
    @Req() request: Request,
  ): Promise<{ isAuthenticated: true; username: string }> {
    return this.authService.login(dto, request);
  }

  @Post('2fa/setup')
  setupTwoFactor(): Promise<{ secret: string; qrCodeDataUrl: string }> {
    return this.authService.setupTwoFactor();
  }

  @Post('2fa/verify')
  verifyTwoFactor(
    @Body() dto: TotpCodeDto,
    @Req() request: Request,
  ): Promise<{ enabled: true }> {
    return this.authService.verifyTwoFactor(dto, request);
  }

  @Post('2fa/disable')
  disableTwoFactor(
    @Body() dto: TotpCodeDto,
    @Req() request: Request,
  ): Promise<{ enabled: false }> {
    return this.authService.disableTwoFactor(dto, request);
  }

  @Post('logout')
  logout(@Req() request: Request): Promise<{ isAuthenticated: false }> {
    return this.authService.logout(request);
  }

  @Get('me')
  @Public()
  me(@Req() request: Request): {
    isAuthenticated: boolean;
    username: string | null;
  } {
    return this.authService.me(request);
  }

  @Get('csrf-token')
  @Public()
  csrfToken(@Req() request: Request): { csrfToken: string } {
    return { csrfToken: request.csrfToken() };
  }
}
