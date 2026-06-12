import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, UploadedFile, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductVariantDto } from './dto/cretae-product-variant.dto';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { RoleGuard } from '@app/auth/guards/role.guard';
import { Role } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@app/auth/enums/role.enum';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([Roles.ADMIN])
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverImage', maxCount: 1 },
      { name: 'images', maxCount: 100 },
    ]),
  )
  create(@Body() createProductDto: CreateProductDto, @UploadedFiles()
  files: {
    coverImage: Express.Multer.File[];
    images?: Express.Multer.File[];
  },) {
    return this.productsService.create(createProductDto, files.coverImage?.[0], files.images ?? [],);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([Roles.ADMIN])
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.productsService.updateStatus(id, body.isActive);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @UploadedFile() file: Express.Multer.File,) {
    return this.productsService.update(id, updateProductDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([Roles.ADMIN])
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([Roles.ADMIN])
  @Post(':id/variants')
  addVariants(
    @Param('id') productId: string,
    @Body() createProductVariantDto: CreateProductVariantDto,
  ) {
    return this.productsService.addVariants(productId, createProductVariantDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([Roles.ADMIN])
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 10))
  addImages(
    @Param('id') id: string,
    @UploadedFile() images: Express.Multer.File[],
  ) {
    return this.productsService.addImages(id, images);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([Roles.ADMIN])
  @Delete(':id/images/:imageId')
  removeImages(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.removeImages(id, imageId);
  }

  @MessagePattern('get_product_price')
  async getProductPrice(@Payload() productId: string) {
    return this.productsService.findOne(productId);
  }

  @MessagePattern('get_product')
  async getProductById(@Payload() prductId: string) {
    return this.productsService.findOne(prductId)
  }
}
