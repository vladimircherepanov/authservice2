import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Get,
  Req,
  Headers,
  UnauthorizedException
} from "@nestjs/common";

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUp.dto';
//import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { GoogleOAuthGuard } from "./guards/google-oauth.guard";
import { JwtService } from "@nestjs/jwt";

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  //@Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() clientToken) {
    const parsedToken = await clientToken.token;
    const tokenData = await this.jwtService.decode(parsedToken);
    console.log(tokenData);
    return await this.authService.signUp(tokenData);
  }

  //@Public()
  //@UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() clientToken) {
    const parsedToken = await clientToken.token;
      //this.jwtService.verify(parsedToken, {secret: '6Ecomyh20ZEZ12HAfKIUfegmc7W9bkaZEoyj4NfsAKI='})
      const tokenData = await this.jwtService.decode(parsedToken);
      return await this.authService.login(tokenData);

  }


  @Post('social')
  @HttpCode(HttpStatus.OK)
  async socialLogin(@Body() clientToken ) {
    const parsedToken = clientToken.token;
    //if(this.jwtService.verify(parsedToken, {})) {
      const tokenData = await this.jwtService.decode(parsedToken);
      return this.authService.googleLogin(tokenData);
    //}
     //else throw new UnauthorizedException("FUCK YOU")
  }


  //@Public()
  @Post('refresh')
  @HttpCode(HttpStatus.CREATED)
  async refresh(@Body() refreshUserDto: RefreshTokenDto) {
    return await this.authService.refresh(refreshUserDto);
  }
}
