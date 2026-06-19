import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { User } from '@app/auth/decorators/user.decorator';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Role } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@app/auth/enums/role.enum';
import { RoleGuard } from '@app/auth/guards/role.guard';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller('order')
export class OrdersController {
  constructor(private readonly orderService: OrderService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@User() userId: string) {
    return this.orderService.placeOrder(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@User() userId: string) {
    return this.orderService.getOrders(userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@User() userId: string, @Param('id') orderId: string) {
    return this.orderService.getOrder(userId, orderId);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([Roles.ADMIN])
  @Patch('status/:id')
  updateOrderStatus(@Param('id') orderId: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.orderService.updateOrderStatus(orderId, updateStatusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  cancelOrder(@User() userId: string, @Param('id') orderId: string) {
    return this.orderService.cancelOrder(userId, orderId)
  }

  @MessagePattern('get_order')
  async getOrderById(@Payload() id: string) {
    return this.orderService.findById(id);
  }

  @EventPattern('payment_succeeded')
  async handlePaymentSucceeded(@Payload() orderId: string) {
    return this.orderService.handlePaymentSuccess(orderId);
  }

  @EventPattern('payment_failed')
  async handlePaymentFailed(@Payload() orderId: string) {
    return this.orderService.handlePaymentFailure(orderId);
  }
}
