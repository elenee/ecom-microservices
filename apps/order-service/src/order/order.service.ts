import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrderStatus,
  PaymentStatus,
} from 'apps/order-service/generated/prisma';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    @Inject('CART_SERVICE') private cartClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private productClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  async placeOrder(userId: string) {
    const cart = await firstValueFrom(this.cartClient.send('get_cart', userId));

    if (!cart || cart.items.length === 0)
      throw new NotFoundException('Cart is empty');

    for (const item of cart.items) {
      const product = await firstValueFrom(
        this.productClient.send('get_product', item.productId),
      );
      if (!product)
        throw new NotFoundException(`Product ${item.productId} not found`);
      if (item.quantity > product.stock) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }
    }

    const decremented: { productId: string; quantity: number }[] = [];

    try {
      for (const item of cart.items) {
        await firstValueFrom(
          this.productClient.send('decrement_stock', {
            productId: item.productId,
            quantity: item.quantity,
          }),
        );
        decremented.push({
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    } catch (error: any) {
      for (const d of decremented) {
        await firstValueFrom(this.productClient.send('restock', d));
      }
      throw new BadRequestException(`Stock decrement failed: ${error.message}`);
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          userId,
          totalAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });
    });

    const user = await this.getUserById(userId);

    this.notificationClient.emit('order_placed', {
      email: user.email,
      orderId: order.id,
    });

    this.cartClient.emit('clear_cart', userId);

    return order;
  }

  async getOrders(userId: string) {
    const orders = await this.prisma.order.findMany({ where: { userId } });
    if (orders.length === 0) throw new NotFoundException('No orders');
    return orders;
  }

  async getOrder(userId, orderId) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancelOrder(userId, orderId) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    for (const item of order.items) {
      await firstValueFrom(
        this.productClient.send('restock', {
          productId: item.productId,
          quantity: item.quantity,
        }),
      );
    }

    return await this.prisma.order.update({
      where: { id: orderId, userId },
      data: { status: OrderStatus.CANCELLED },
      include: { items: true },
    });
  }

  async updateOrderStatus(orderId, updateStatusDto: UpdateStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    return await this.prisma.order.update({
      where: { id: orderId },
      data: { status: updateStatusDto.status },
    });
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
    });
  }

  async findById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private async getUserById(userId: string) {
    const user = await firstValueFrom(this.userClient.send('get_user', userId));
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async handlePaymentSuccess(orderId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.CONFIRMED,
      },
    });

    const user = await this.getUserById(order.userId);

    this.notificationClient.emit('payment_succeeded', {
      email: user.email,
      amount: order.totalAmount,
    });

    return order;
  }

  async handlePaymentFailure(orderId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.FAILED },
      include: { items: true },
    });

    for (const item of order.items) {
      this.notificationClient.send('restock', {
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    return order;
  }
}
