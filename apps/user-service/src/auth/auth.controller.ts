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

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  signIn(@Req() req){
    return this.authService.signIn(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  currentUser(@User() userId: string ){
    return this.authService.currectUser(userId)
  }
}
