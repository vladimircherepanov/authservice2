import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from "../users/users.service";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { AuthController } from "./auth.controller";
import { LocalStrategy } from "./strategies/local.stradegy";
import { PassportModule } from "@nestjs/passport";
//import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from "./strategies/google.stradegy";


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    PassportModule,
    //ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, GoogleStrategy]
})
export class AuthModule {}
