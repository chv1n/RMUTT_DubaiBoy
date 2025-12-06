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
  ) {
    const user = await this.user.create(registerDto);
    await this.user.save(user)
    return {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      username: user.username,
      role: user.role,
    };
  }

  async findAll() {
    const users = await this.user.find()
    return users.map(user => ({
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      username: user.username,
      role: user.role,
    }))
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
    };
  }

  async update(id: number, updateUserDto: UpdateDto) {
    const user = await this.user.findOne({ where: { id } });

    if (!user) throw new Error('User not found');

    if (updateUserDto.pass_word) {
      updateUserDto.pass_word = await bcrypt.hash(updateUserDto.pass_word, 10);
    }
    Object.assign(user, updateUserDto);
    await this.user.save(user);
    return {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      username: user.username,
      role: user.role,
    };
  }

  async remove(id: number) {
    return await this.user.delete(id);
  }

  async findByUsername(username: string) {
    const user = await this.user.findOne({ where: { username } })
    return {
      id: user?.id,
      email: user?.email,
      fullname: user?.fullname,
      username: user?.username,
      role: user?.role,
    };
  }

  async findById(id: number) {
    const user = await this.user.findOne({ where: { id } })
    return {
      id: user?.id,
      email: user?.email,
      fullname: user?.fullname,
      username: user?.username,
      role: user?.role,
    };
  }
}
