import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { randomUUID } from 'crypto';

interface AuthUser {
  id: string;
  email: string;
}

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

        const hashedPasswd = await bcrypt.hash(signUpDto.password, 10);
        await this.usersService.create({...signUpDto, password: hashedPasswd});
        return 'User created successfully'
    }

    async validateUser(signInDto: SignInDto){
        const user = await this.usersService.findByEmail(signInDto.email)
        if(!user) throw new UnauthorizedException('Invalid Credentials')
        const isPasswValid = await bcrypt.compare(signInDto.password, user.password)
        if(!isPasswValid) throw new UnauthorizedException('Invalid Credentials')
        return user
    }

    async signIn(user: AuthUser, userAgent?: string){
        const payload = {
            sub: user.id
        }
        const accessToken = this.jwtService.sign(payload, {expiresIn: '1h'})
        const refreshToken = await this.createRefreshToken(user.id, userAgent);

        return {accessToken, refreshToken}
    }

    async currentUser(userId: string){
        const user = await this.prisma.user.findUnique({where: {id: userId}})
        if(!user) throw new NotFoundException('User not found');
        const {password, ...rest} = user;
        return rest;
    }

    async createRefreshToken(id: string, userAgent?: string){
        const jti = randomUUID()
        const refreshToken = this.jwtService.sign(
            {sub: id, jti},
            {expiresIn: '7d'})

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7)
        await this.prisma.refreshToken.create({
            data: {
                jti,
                userId: id,
                userAgent: userAgent || null,
                expiresAt
            }
        })
        return refreshToken;
    }

    async accessRefreshToken(refreshToken: string, userAgent?:string){
        if(!refreshToken) throw new UnauthorizedException()
        try {
            const payload = this.jwtService.verify(refreshToken);
            const savedToken = await this.prisma.refreshToken.findUnique({
                where: {jti: payload.jti}
            })
            if(!savedToken) throw new UnauthorizedException();

            await this.prisma.refreshToken.delete({
                where: {jti: payload.jti}
            })
            const accessToken = this.jwtService.sign({sub: payload.sub}, {expiresIn: '1h'})
            const newRefreshToken = await this.createRefreshToken(payload.sub, userAgent)

            return {accessToken, refreshToken: newRefreshToken}
        } catch {
            throw new UnauthorizedException()
        }
    }

    async signOut(refreshToken: string){
        if(!refreshToken) throw new UnauthorizedException()
        try {
            const payload = this.jwtService.verify(refreshToken)
            await this.prisma.refreshToken.delete({where: {jti: payload.jti}})
            return 'signed out successfully'
        } catch(error) {
            const decoded = this.jwtService.decode(refreshToken)
            if(decoded && decoded['jti']){
                await this.prisma.refreshToken.deleteMany({where: {jti: decoded['jti']}})
            }
        }
    }

    async signOutAll(userId: string){
        await this.prisma.refreshToken.deleteMany({where: {userId}})
    }
}
