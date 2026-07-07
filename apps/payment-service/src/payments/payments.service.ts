import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripeService: any
  private readonly stripeWebhookSecret: string
  private readonly isMock: boolean;


  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy
  ) {
    this.isMock = this.configService.get<string>('PAYMENT_MODE') === 'mock';

    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY')
    this.stripeWebhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET', '')

    if (!this.isMock) {
      const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');

      if (!stripeKey) {
        throw new Error('STRIPE_SECRET_KEY is missing from environment variables');
      }

      this.stripeService = new Stripe(stripeSecretKey!, {});
    }
  }


  async checkout(userId: string, orderId: string) {
    let stripeIntent: any;

    const order = await firstValueFrom(
      this.orderClient.send('get_order', orderId)
    )

    if (!order) throw new NotFoundException('Order not found');
    if (this.isMock) {
      return {
        clientSecret: 'mock_client_secret',
      };
    }

    stripeIntent = await this.stripeService.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: 'usd',
      metadata: { orderId },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    })

    await this.prisma.payment.upsert({
      where: { orderId },
      update: {
        stripePaymentId: stripeIntent.id,
        status: 'PENDING',
        amount: order.totalAmount
      },
      create: {
        orderId,
        userId,
        stripePaymentId: stripeIntent.id,
        status: 'PENDING',
        amount: order.totalAmount
      }
    });

    return { clientSecret: stripeIntent.client_secret }

  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    let event: any;

    try {
      event = this.stripeService.webhooks.constructEvent(
        rawBody,
        signature,
        this.stripeWebhookSecret
      );
    } catch (error: any) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const intent = event.data.object as any
        await this.prisma.payment.update({
          where: { stripePaymentId: intent.id },
          data: { status: 'SUCCEEDED' }
        });
        this.orderClient.emit('payment_succeeded', intent.metadata.orderId);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as any;
        await this.prisma.payment.update({
          where: { stripePaymentId: failedIntent.id },
          data: { status: 'FAILED' }
        });
        this.orderClient.emit('payment_failed', failedIntent.metadata.orderId);
        break;
    }

    return { received: true };
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripeService.paymentIntents.confirm(
      paymentIntentId,
      { payment_method: 'pm_card_visa' }
    );

    if (paymentIntent.status === 'succeeded') {
      const orderId = paymentIntent.metadata.orderId;
      await this.prisma.payment.update({
        where: { orderId },
        data: { status: 'SUCCEEDED' }
      });
      this.orderClient.emit('payment_succeeded', orderId);
    }

    return { status: paymentIntent.status };
  }

}
