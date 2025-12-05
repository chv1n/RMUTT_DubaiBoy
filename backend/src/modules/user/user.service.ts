import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateDto } from './dto/update.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
  ) { }

  async register(
    registerDto: RegisterDto,
  ): Promise<User> {
    const user = await this.user.create(registerDto);

    return await this.user.save(user);
  }

  async findAll() {
    return await this.user.find();
  }

  async findOne(id: number) {

    const user = await this.user.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return {
      email: user.email,
      fullname: user.fullname,
      username: user.username,
      id: user.id,
      role: user.role,
      refresh_token: user.refresh_token,
    };
  }

  async update(id: number, updateUserDto: UpdateDto) {
    const user = await this.user.findOne({ where: { id } });

    if (!user) throw new Error('User not found');

    if (updateUserDto.pass_word) {
      updateUserDto.pass_word = await bcrypt.hash(updateUserDto.pass_word, 10);
    }
    Object.assign(user, updateUserDto);

    return await this.user.save(user);
  }

  async remove(id: number) {
    return await this.user.delete(id);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.user.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return await this.user.findOne({ where: { id } });
  }
}
