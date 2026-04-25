import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(ThrottlerGuard)
    login(@Body() dto: LoginDto, @Req() request: Request): Promise<{ isAuthenticated: true; username: string }> {
        return this.authService.login(dto, request);
    }

    @Post('logout')
    logout(@Req() request: Request): Promise<{ isAuthenticated: false }> {
        return this.authService.logout(request);
    }

    @Get('me')
    me(@Req() request: Request): { isAuthenticated: boolean; username: string | null } {
        return this.authService.me(request);
    }

    @Get('csrf-token')
    csrfToken(@Req() request: Request): { csrfToken: string } {
        return { csrfToken: request.csrfToken() };
    }
}
