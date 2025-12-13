import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Request, Query, ParseIntPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { Auth } from 'src/common/decorators/auth.decorator';


@Controller({
  path: 'users',
  version: '1',
})
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService,
  ) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.register(createUserDto);
    return {
      message: 'เพิ่มสำเร็จ',
      data
    };
  }


  @UseGuards(AtGuard)
  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.userService.findAll(query);
  }

  @Get('admin-only')
  @Auth(Role.ADMIN)
  adminOnly() {
    return 'This is admin only';
  }

  @Get('super-admin-only')
  @Auth(Role.ADMIN)
  superAdminOnly() {
    return 'This is super admin only';
  }


  @Auth()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Auth(Role.SUPER_ADMIN)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.userService.update(id, updateUserDto);
    return {
      message: 'แก้ไขสำเร็จ',
      data
    };
  }

  @Auth(Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return {
      message: 'ลบสำเร็จ'
    };
  }

  @Put(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.userService.restore(id);
    return {
      message: 'กู้คืนสำเร็จ'
    };
  }
}
