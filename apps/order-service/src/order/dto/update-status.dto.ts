import { OrderStatus, PaymentStatus } from 'apps/order-service/generated/prisma';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
    @IsEnum(OrderStatus)
    @IsNotEmpty()
    status!: OrderStatus;
}

export class PaymentStatusDto {
    @IsEnum(PaymentStatus)
    @IsNotEmpty()
    paymentStatus!: PaymentStatus
}