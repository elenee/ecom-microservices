import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item-dto';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { User } from '@app/auth/decorators/user.decorator';
import { EventPattern, MessagePattern, Payload, RpcException } from '@nestjs/microservices';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@User() userId: string) {
    return this.cartService.getCart(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  addItem(@User() userId: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(userId, addToCartDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:itemId')
  updateItem(@User() userId: string, @Param('itemId') itemId: string, @Body() updateCartDto: UpdateCartItemDto) {
    return this.cartService.updateItemQuantity(userId, itemId, updateCartDto.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('items/:itemId')
  removeItem(@User() userId: string, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  clearCart(@User() userId: string) {
    return this.cartService.clearCart(userId);
  }

  @MessagePattern('get_cart')
  async getCartByUserId(@Payload() userId: string) {
    try {
      return await this.cartService.getCart(userId);
    } catch (error: any) {
      throw new RpcException(error.message ?? "Cart lookup failed")
    }
  }

  @EventPattern('clear_cart')
  async handleClearCart(@Payload() userId: string) {
    return await this.cartService.clearCart(userId);
  }
}
