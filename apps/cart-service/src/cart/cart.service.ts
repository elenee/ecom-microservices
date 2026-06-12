import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CartService {
  constructor(@Inject('PRODUCT_SERVICE') private productClient: ClientProxy,
    private prisma: PrismaService) { }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true }
    })
    if (!cart) throw new NotFoundException('Cart is empty');
    return cart
  }

  async addItem(userId: string, addToCartDto: AddToCartDto) {
    if (!addToCartDto) throw new BadRequestException('Request body is required');
    if (!userId) throw new UnauthorizedException();
    const product = await firstValueFrom(
      this.productClient.send('get_product', addToCartDto.productId)
    )
    if (!product) throw new NotFoundException('Product not found');
    const price = product.price

    const cart = await this.prisma.cart.findUnique({ where: { userId } })
      ?? await this.prisma.cart.create({ data: { userId } })

    if (addToCartDto.quantity > product.stock) {
      throw new BadRequestException('Insufficient stock');
    }

    const existingItem = await this.prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: product.id } })
    if (existingItem) {
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException('Insufficient stock');
      }
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      })
    } else {
      await this.prisma.cartItem.create({
        data: { ...addToCartDto, cartId: cart.id, price }
      })
    }

    return await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    })
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new BadRequestException('cart is empty');

    const existingItem = await this.prisma.cartItem.findFirst({ where: { cartId: cart.id, id: productId } })
    if (!existingItem) throw new NotFoundException('Item not found in cart');

    if (existingItem) {
      if (existingItem.quantity > 1) {
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity - 1 }
        })
      } else {
        await this.prisma.cartItem.delete({ where: { id: existingItem.id } })
      }
    } else {
      throw new NotFoundException();
    }

    return await this.prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } })
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id }
    });
    if (!item) throw new NotFoundException('Cart item not found');

    const product = await firstValueFrom(
      this.productClient.send('get_product', item.productId)
    );
    if (quantity > product.stock) throw new BadRequestException('Insufficient stock');

    if (quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      });
    }

    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    });
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new BadRequestException('cart is empty');

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return this.prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } });
  }

}
