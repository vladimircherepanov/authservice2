import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { UsersService } from "../users/users.service";


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private readonly secretKey: string = process.env.JWT_SECRET;
  private readonly expires: string = process.env.JWT_EXPIRES;
  private readonly refreshExpires: string = process.env.JWT_REFRESH_EXPIRES;

  async signUp(signUpDto) {
    const login = signUpDto.login;
    const user = await this.usersService.getByLogin(login);
    if (!user) {
      return await this.usersService.create(signUpDto);
    } else throw new UnprocessableEntityException('Login already in use');
  }

  async login(loginDto) {
    const login = loginDto.login;
    const password = loginDto.password;
    const user = await this.usersService.getByLogin(login);
    if (user) {
      const passwordCheck = await user.user.checkPassword(password);
      if (passwordCheck) {
        const payload = { userId: user.user.id, login: user.user.login };

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

