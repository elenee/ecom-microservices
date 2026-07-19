import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('order_placed')
  async handleOrderPlaced(@Payload() data: { email: string; orderId: string }) {
    await this.notificationService.sendEmail(
      data.email,
      'Order Confirmation',
      'order_template_ID',
      { orderId: data.orderId },
    );
  }

  @EventPattern('payment_succeeded')
  async handlePaymentSuccess(
    @Payload() data: { email: string; amount: number },
  ) {
    await this.notificationService.sendEmail(
      data.email,
      'Payment Received',
      'order_template_ID',
      { amount: data.amount },
    );
  }
}
