import { IsString } from 'class-validator';

export class CreateUserDto {

  @IsString()
  firstname: string;

  @IsString()
  surname: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}
