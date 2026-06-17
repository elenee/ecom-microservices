import { Controller, Post, Param, Delete, UseGuards, Headers, Req, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { User } from '@app/auth/decorators/user.decorator';
import type { RawBodyRequest } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @UseGuards(JwtAuthGuard)
  @Post('checkout/:orderId')
  checkout(@User() userId: string, @Param('orderId') orderId: string) {
    return this.paymentsService.checkout(userId, orderId);
  }

  @Post('webhook')
  handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm/:paymentIntentId')
  confirmPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.confirmPayment(paymentIntentId);
  }
}
