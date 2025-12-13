import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Request, Query, ParseIntPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';


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
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminOnly() {
    return 'This is admin only';
  }

  @Get('super-admin-only')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  superAdminOnly() {
    return 'This is super admin only';
  }


  @UseGuards(AtGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }


  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.userService.update(id, updateUserDto);
    return {
      message: 'แก้ไขสำเร็จ',
      data
    };
  }

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
