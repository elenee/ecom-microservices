import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrtpt from 'bcrypt'
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private readonly jwtService: JwtService,
        private prisma: PrismaService){}

    async signUp(signUpDto: SignUpDto){
        const user = await this.usersService.findByEmail(signUpDto.email);
        if(user) {
            throw new BadRequestException('User with this email already exists')
        }

        const hashedPasswd = await bcrtpt.hash(signUpDto.password, 10);
        await this.usersService.create({...signUpDto, password: hashedPasswd});
        return 'User created successfully'
    }

    async validateUser(signInDto: SignInDto){
        const user = await this.usersService.findByEmail(signInDto.email)
        if(!user) throw new UnauthorizedException('Invalid Credentials')
        const isPasswValid = await bcrtpt.compare(signInDto.password, user.password)
        if(!isPasswValid) throw new UnauthorizedException('Invalid Credentials')
        return user
    }

    async signIn(user: any){
        const payload = {
            sub: user.id
        }
        const accessToken = await this.jwtService.sign(payload, {expiresIn: '1h'})
        return {accessToken}
    }

    async currectUser(userId: string){
        const user = await this.prisma.user.findUnique({where: {id: userId}})
        if(!user) throw new NotFoundException('User not found');
        const {password, ...rest} = user;
        return rest;
    }
}
