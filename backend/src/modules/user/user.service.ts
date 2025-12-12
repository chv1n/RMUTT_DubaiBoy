import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ISoftDeletable } from 'src/common/interfaces/soft-deletable.interface';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { QueryHelper } from 'src/common/helpers/query.helper';
import { CrudHelper } from 'src/common/helpers/crud.helper';
import { SoftDeleteHelper } from 'src/common/helpers/soft-delete.helper';


@Injectable()
export class UserService implements ISoftDeletable {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
  ) { }

  async register(
    createUserDto: CreateUserDto,
  ) {
    const user = await this.user.create(createUserDto);
    return await this.user.save(user);
  }

  async findAll(query: BaseQueryDto) {
    return QueryHelper.paginate(this.user, query, { sortField: 'username' });
  }

  async findOne(id: number) {
    return this.user.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return CrudHelper.update(this.user, id, 'id', updateUserDto, 'User not found');
  }

  async remove(id: number) {
    await SoftDeleteHelper.remove(this.user, id, 'id', 'User not found');
  }

  async restore(id: number) {
    await SoftDeleteHelper.restore(this.user, id, 'id', 'User not found');
  }

  async findByUsername(username: string) {
    return await this.user.findOne({ where: { username } });
  }

  async findById(id: number) {
    return this.findOne(id);
  }
}

