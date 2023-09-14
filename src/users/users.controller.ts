import {
  Controller,
  Param,
  Body,
  HttpCode,
  Get,
  Post,
  Put,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
//import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll() {
    try {
      return await this.UsersService.getAll();
    } catch (error) {
      throw HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
      uuid: string,
  ) {
    const user = await this.UsersService.getById(uuid);
    if (user) {
      return user;
    } else {
      throw new NotFoundException('User not found');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.UsersService.create(createUserDto);
    } catch (error) {
      throw HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  /*@Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async update(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
      uuid: string,
    @Body() updateUserDto: UpdatePasswordDto,
  ) {
    const { oldPassword, newPassword } = updateUserDto;
    const checkPassword = await this.UsersService.checkPassword(
      uuid,
      oldPassword,
    );
    const user = await this.UsersService.getById(uuid);
    if (!user) {
      throw new NotFoundException('User not found');
    } else {
      if (checkPassword) {
        const updatedUser = await this.UsersService.update(uuid, newPassword);
        return updatedUser;
      } else {
        throw new ForbiddenException('Old password is wrong');
      }
    }
  }

   */

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
      uuid: string,
  ): Promise<void> {
    const user = await this.UsersService.getById(uuid);
    if (!user) {
      throw new NotFoundException('User not found');
    } else {
      await this.UsersService.delete(uuid);
    }
  }
}