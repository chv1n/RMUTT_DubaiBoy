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
      full_name: user.full_name,
      user_name: user.user_name,
      id: user.id,
      role: user.role,
    };
  }

  async upDate(id: number, updateUserDto: UpdateDto) {
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

  async findByUsername(user_name: string): Promise<User | null> {
    return await this.user.findOne({ where: { user_name } });
  }
}
