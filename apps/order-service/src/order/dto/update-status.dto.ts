import { OrderStatus } from 'apps/order-service/generated/prisma';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
    @IsEnum(OrderStatus)
    @IsNotEmpty()
    status!: OrderStatus;
}