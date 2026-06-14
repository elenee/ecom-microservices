import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { User } from '@app/auth/decorators/user.decorator';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Role } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@app/auth/enums/role.enum';
import { RoleGuard } from '@app/auth/guards/role.guard';

@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrdersController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  create(@User() userId: string) {
    return this.orderService.placeOrder(userId);
  }

  @Get()
  findAll(@User() userId: string) {
    return this.orderService.getOrders(userId)
  }

  @Get(':id')
  findOne(@User() userId: string, @Param('id') orderId: string) {
    return this.orderService.getOrder(userId, orderId);
  }


  @UseGuards(RoleGuard)
  @Role([Roles.ADMIN])
  @Patch('status/:id')
  updateOrderStatus(@Param('id') orderId: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.orderService.updateOrderStatus(orderId, updateStatusDto);
  }

  @Patch(':id')
  cancelOrder(@User() userId: string, @Param('id') orderId: string) {
    return this.orderService.cancelOrder(userId, orderId)
  }

}
