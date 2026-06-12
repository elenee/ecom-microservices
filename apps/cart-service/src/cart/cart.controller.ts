import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item-dto';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { User } from '@app/auth/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  getCart(@User() userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@User() userId: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(userId, addToCartDto);
  }

  @Patch('items/:itemId')
  updateItem(@User() userId: string, @Param('itemId') itemId: string, @Body() updateCartDto: UpdateCartItemDto) {
    return this.cartService.updateItemQuantity(userId, itemId, updateCartDto.quantity);
  }

  @Delete('items/:itemId')
  removeItem(@User() userId: string, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete()
  clearCart(@User() userId: string) {
    return this.cartService.clearCart(userId);
  }
}
