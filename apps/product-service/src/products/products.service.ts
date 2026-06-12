import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify'
import { S3Service } from '@app/s3';
import { CreateProductVariantDto } from './dto/cretae-product-variant.dto';
import { Prisma } from '@prisma/client';


@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private awsS3Service: S3Service) { }

  async create(createProductDto: CreateProductDto, coverImage: Express.Multer.File, images: Express.Multer.File[]) {
    try {
      const slug = slugify(createProductDto.name, { lower: true })
      const product = await this.prisma.product.create({ data: { ...createProductDto, slug } })

      const allFiles = [
        ...(coverImage ? [{ file: coverImage, isPrimary: true }] : []),
        ...(images.map(file => ({ file, isPrimary: false })))
      ]

      await Promise.all(
        allFiles.map(async ({ file, isPrimary }) => {
          const key = `products/${product.id}/${Date.now()}-${file.originalname}`;
          const url = await this.awsS3Service.uploadFile(key, file.buffer, file.mimetype);
          return this.prisma.productImage.create({
            data: { url, key, productId: product.id, isPrimary },
          });
        })
      )

      return this.prisma.product.findUnique({
        where: { id: product.id },
        include: { images: true, variants: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Product with this ${e.meta?.target} already exists`);
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.product.findMany()
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, coverImage: Express.Multer.File,) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException();
    if (coverImage) {
      const key = `products/${product.id}/${Date.now()}-${coverImage.originalname}`;
      const url = await this.awsS3Service.uploadFile(key, coverImage.buffer, coverImage.mimetype);

      const existingCover = await this.prisma.productImage.findFirst({
        where: { productId: id, isPrimary: true },
      })
      if (existingCover) {
        await this.prisma.productImage.update({ where: { id: existingCover.id }, data: { url, key } })
      } else {
        await this.prisma.productImage.create({ data: { key, url, productId: id, isPrimary: true } })
      }

    }

    return await this.prisma.product.update(
      {
        where: { id },
        data: updateProductDto,
        include: { images: true, variants: true }
      })
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException();
    await this.prisma.product.update({ where: { id }, data: { isActive: false } })
    return 'Product deleted successfully'
  }

  async updateStatus(id: string, isActive: boolean) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException();
    return await this.prisma.product.update({ where: { id }, data: { isActive } })
  }

  async addImages(id: string, images: Express.Multer.File[]) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException();
    Promise.all(
      images.map(async (file) => {
        const key = `products/${product.id}/${Date.now()}-${file.originalname}`;
        const url = await this.awsS3Service.uploadFile(key, file.buffer, file.mimetype);
        return this.prisma.productImage.create({
          data: { url, key, productId: product.id, isPrimary: false },
        });
      })
    )

    return this.prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, variants: true },
    });
  }


  async removeImages(id: string, imageId: string) {
    const productImage = await this.prisma.productImage.findUnique({ where: { productId: id, id: imageId } })
    if (!productImage) throw new NotFoundException();
    await this.awsS3Service.deleteFile(productImage.key)
    await this.prisma.productImage.delete({ where: { id: productImage.id } })
    return 'Image deleted successsfully'
  }

  async addVariants(id, createProductVariantDto: CreateProductVariantDto) {
    return await this.prisma.productVariant.create({
      data: { ...createProductVariantDto, productId: id }
    })
  }
}
