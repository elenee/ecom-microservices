import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify'
import { S3Service } from '@app/s3';
import sharp from 'sharp';
import { Prisma } from '@prisma/client';


@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService, private awsS3Service: S3Service) { }

  async create(createCategoryDto: CreateCategoryDto, image?: Express.Multer.File) {
    try {
      const slug = slugify(createCategoryDto.name, { lower: true })
      const category = await this.prisma.category.create({ data: { ...createCategoryDto, slug } })

      if (image) {
        let resizedBuffer = await sharp(image.buffer).resize(800, 600, {
          fit: 'cover',
          position: 'center'
        }).toBuffer()

        resizedBuffer = await sharp(resizedBuffer).jpeg({ quality: 80 }).toBuffer()

        const key = `categories/${category.id}/${Date.now()}-${image.originalname}`;
        const url = await this.awsS3Service.uploadFile(key, resizedBuffer, image.mimetype)
        await this.prisma.categoryImage.create({
          data: { url, key, categoryId: category.id }
        })
      }


      return await this.prisma.category.findUnique({
        where: { id: category.id },
        include: { images: true }
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Category with this name already exists');
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.category.findMany({
      where: {
        parentCategoryId: null,
        isActive: true,
      },
      include: { images: true },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, image: Express.Multer.File) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) throw new NotFoundException('Category not found');

    if (image) {
      let resizedBuffer = await sharp(image.buffer).resize(800, 600, {
        fit: 'cover',
        position: 'center'
      }).toBuffer()


      const key = `categories/${category.id}/${Date.now()}-${image.originalname}`;
      const url = await this.awsS3Service.uploadFile(key, resizedBuffer)

      const existingCover = await this.prisma.categoryImage.findFirst({ where: { categoryId: id } })
      if (existingCover) {
        await this.prisma.categoryImage.update({
          where: { id: existingCover.id },
          data: { url, key }
        })
      } else {
        await this.prisma.categoryImage.create({
          data: { url, key, categoryId: category.id },
        });
      }

    }
    return await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: { images: true },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    return 'category deleted successfully';
  }
}
