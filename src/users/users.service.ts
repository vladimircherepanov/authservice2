import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { User } from "./entities/user.entity";
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async getById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      return { user };
    }
    return false;
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      return { user };
    }
    return false;
  }



  async create(tokenData) {
    const user = this.usersRepository.create({
      id: uuidv4(),
      login: tokenData.email,
      email: tokenData.email,
      role: "user",
      confirmed: false,
      firstname: tokenData.firstname,
      surname: tokenData.surname,
      password: tokenData.password,
      provider: "email",
      avatarLink: "",
      phone: "",
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const savedUser = await this.usersRepository.save(user);
    console.log(savedUser);
    const { id, email, surname, role, firstname, avatarLink, confirmed } = savedUser;

    return { id, email, surname, role, firstname, avatarLink, confirmed };
  }

  async createSocial(tokenData) {
    const user = this.usersRepository.create({
      id: uuidv4(),
      login: tokenData.email,
      email: tokenData.email,
      role: "user",
      confirmed: true,
      firstname: tokenData.given_name,
      surname: tokenData.family_name,
      password: "1234567654dscc",
      provider: "google",
      avatarLink: "",
      phone: "",
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const savedUser = await this.usersRepository.save(user);
    const { id, email, surname, role, firstname, avatarLink, confirmed } = savedUser;
    return {
      userId: id,
      email: email,
      role: role,
      surname: surname,
      firstname: firstname,
      picture: avatarLink,
      confirmed: confirmed,
      };
  }

  async checkPassword(id: string, oldPassword: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      return user.checkPassword(oldPassword);
    } else return false;
  }

  async update(id: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      user.password = newPassword;
      user.version++;
      user.updatedAt = Date.now();
      await this.usersRepository.save(user);
      return {
        id: user.id,
        email: user.email,
        version: user.version,
        createdAt: Number(user.createdAt),
        updatedAt: Number(user.updatedAt),
      };
    } else return false;
  }

  async delete(id: string): Promise<boolean> {
    const user = this.usersRepository.findOneBy({ id });
    if (user) {
      await this.usersRepository.delete(id);
      return true;
    } else return false;
  }
}
