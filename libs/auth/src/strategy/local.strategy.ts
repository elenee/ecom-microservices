import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "apps/user-service/src/auth/auth.service";
import { Strategy } from "passport-local";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email' })
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.authService.validateUser({
            email: username,
            password
        });
        return user;
    }
}