import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import type { Response } from 'express';
import { LocalAuthGuard } from '@app/auth/guards/local-auth.guard';
import { COOKIE_OPTIONS } from '@app/auth/constants/cookie.config';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { User } from '@app/auth/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto)
  }

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  async signIn(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userAgent = req.headers['user-agent']
    const { accessToken, refreshToken } = await this.authService.signIn(req.user, userAgent);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    return { accessToken }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async currentUser(@User() userId: string) {
    return this.authService.currentUser(userId)
  }

  @Post('refresh-token')
  async accessRefreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userAgent = req.headers['user-agent']
    const refreshToken = req.cookies['refreshToken']

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.accessRefreshToken(refreshToken, userAgent)
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS)

    return { accessToken }
  }

  @Post('sign-out')
  async signOut(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken']
    await this.authService.signOut(refreshToken)

    res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, maxAge: 0 })
    return 'Signed out successfully'
  }

  @Post('sign-out-all')
  @UseGuards(JwtAuthGuard)
  async signOutAll(@User() userId: string, @Res({ passthrough: true }) res: Response) {
    await this.authService.signOutAll(userId)
    res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, maxAge: 0 })
    return 'Signed out from all devices';
  }

}
