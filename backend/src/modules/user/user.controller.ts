import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }


  @UseGuards(AtGuard)
  @Get()
  findAll(@Request() req) {
    console.log(req.user)
    return this.userService.findAll();
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
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }


  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateDto) {
    console.log(updateUserDto);
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
