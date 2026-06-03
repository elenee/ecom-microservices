import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { RoleGuard } from '@app/auth/guards/role.guard';
import { Role } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@app/auth/enums/role.enum';


@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([Roles.ADMIN])
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() createCategoryDto: CreateCategoryDto, @UploadedFile() file: Express.Multer.File) {
    return this.categoriesService.create(createCategoryDto, file);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @UploadedFile() file: Express.Multer.File) {
    return this.categoriesService.update(id, updateCategoryDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
