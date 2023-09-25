import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Request, Get, Req, Headers } from "@nestjs/common";

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
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  //@Public()
  //@UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('social')
  @HttpCode(HttpStatus.OK)
  async socialLogin(@Body() clientToken ) {
    //const jwt = request.headers.replace('Bearer ', '');
    //const json = this.jwtService.decode(jwt, { json: true }) as { uuid: string };
    //return await this.authService.login(loginDto.email, loginDto.password);
    const parsedToken = clientToken.token;
    const tokenData = await this.jwtService.decode(parsedToken);

    return this.authService.googleLogin(tokenData);
  }


  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('/google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req) {
    return this.authService.googleLogin(req);
  }

  //@Public()
  @Post('refresh')
  @HttpCode(HttpStatus.CREATED)
  async refresh(@Body() refreshUserDto: RefreshTokenDto) {
    return await this.authService.refresh(refreshUserDto);
  }
}
