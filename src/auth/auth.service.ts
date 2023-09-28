import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { SignUpDto } from "./dto/signUp.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private readonly secretKey: string = process.env.JWT_SECRET;
  private readonly expires: string = process.env.JWT_EXPIRES;
  private readonly refreshExpires: string = process.env.JWT_REFRESH_EXPIRES;

  async signUp(tokenData) { //add validation by DTO
    const email = tokenData.email;
    const existingUser = await this.usersService.getByEmail(email);
    if (!existingUser) {
      const user =  await this.usersService.create(tokenData);
      const payload = {
        userId: user.id,
        role: user.role,
        firstname: user.firstname,
        surname: user.surname,
        confirmed: user.confirmed
      };
      return {
        accessToken: await this.jwtService.signAsync(payload, {
          secret: this.secretKey,
          expiresIn: this.expires,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          secret: this.secretKey,
          expiresIn: this.refreshExpires,
        }),
      };
    } else throw new UnprocessableEntityException('email already in use');
  }

  async login(tokenData) { //add validation by DTO
    const email = tokenData.email;
    const password = tokenData.password;
    const user = await this.usersService.getByEmail(email);
    if (user) {
      const passwordCheck = await user.user.checkPassword(password);
      if (passwordCheck) {
        const payload = {
          userId: user.user.id,
          role: user.user.role,
          firstname: user.user.firstname,
          surname: user.user.surname,
          confirmed: user.user.confirmed
        };

        return {
          accessToken: await this.jwtService.signAsync(payload, {
            secret: this.secretKey,
            expiresIn: this.expires,
          }),
          refreshToken: await this.jwtService.signAsync(payload, {
            secret: this.secretKey,
            expiresIn: this.refreshExpires,
          }),
        };

      }
      throw new ForbiddenException('Login or password wrong');
    }
    throw new ForbiddenException('Login or password wrong');
  }

  async googleLogin(tokenData) {
    if (!tokenData) {
      throw new UnprocessableEntityException('no data')
    }
    else {
      const user = await this.usersService.getByEmail(tokenData.email);
      if(user) {
        const payload = {
          userId: user.user.id,
          email: user.user.email,
          role: user.user.role,
          firstname: user.user.firstname,
          surname: user.user.surname,
          picture: user.user.avatarLink,
          confirmed: user.user.confirmed
        };

        return {
          accessToken: await this.jwtService.signAsync(payload, {
            secret: this.secretKey,
            expiresIn: this.expires,
          }),
          refreshToken: await this.jwtService.signAsync(payload, {
            secret: this.secretKey,
            expiresIn: this.refreshExpires,
          }),
        };
      }
      else {
        const user = await this.usersService.createSocial(tokenData);
        const payload = { user };
        return {
          accessToken: await this.jwtService.signAsync(payload, {
            secret: this.secretKey,
            expiresIn: this.expires,
          }),
          refreshToken: await this.jwtService.signAsync(payload, {
            secret: this.secretKey,
            expiresIn: this.refreshExpires,
          }),
        };
      }
    }
  }

  async refresh(refreshUserDto): Promise<{ accessToken }> {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshUserDto.refreshToken,
        {
          secret: this.secretKey,
        },
      );
      delete payload.iat;
      delete payload.exp;

      console.log(payload);
      const newAccessToken = await this.jwtService.signAsync(payload, {
        secret: this.secretKey,
        expiresIn: this.expires,
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

