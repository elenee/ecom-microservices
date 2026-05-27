import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from './decorators/user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto:SignUpDto){
    return this.authService.signUp(signUpDto)
  }

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  signIn(@Req() req){
    const userAgent = req.headers['user-agent']
    return this.authService.signIn(req.user, userAgent)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  currentUser(@User() userId: string ){
    return this.authService.currentUser(userId)
  }
  
  @Post('refresh-token')
  accessRefreshToken(@Body('refreshToken') refreshToken: string, @Req() req){
    const userAgent = req.headers['user-agent']
    return this.authService.accessRefreshToken(refreshToken, userAgent)
  }

  @Post('sign-out')
  signOut(@Body('refreshToken') refreshToken: string){
    return this.authService.signOut(refreshToken)
  }

  @Post('sign-out-all')
  @UseGuards(JwtAuthGuard)
  signOutAll(@User() userId: string){
    return this.authService.signOutAll(userId)
  }

}
