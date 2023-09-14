import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

@Entity()
@Unique(['login'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstname: string;

  @Column()
  surname: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column()
  confirmed: boolean;

  @Column()
  version: number;

  @Column({ type: 'bigint' })
  createdAt: number;

  @Column({ type: 'bigint' })
  updatedAt: number;

  /////////////////////

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, process.env.CRYPT_SALT);
  }

  checkPassword(oldPassword: string): Promise<boolean> {
    return bcrypt.compare(oldPassword, this.password);
  }
}

