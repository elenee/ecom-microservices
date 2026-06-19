import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@app/auth/decorators/user.decorator';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { RoleGuard } from '@app/auth/guards/role.guard';
import { Role } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@app/auth/enums/role.enum';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@User() id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([Roles.ADMIN])
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  remove(@User() id: string) {
    return this.usersService.remove(id);
  }

  @MessagePattern('get_user')
  async getUserById(@Payload() userId: string) {
    return this.usersService.findOne(userId);
  }
}
