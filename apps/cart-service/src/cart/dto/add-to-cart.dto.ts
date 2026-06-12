import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class AddToCartDto {
    @IsNotEmpty()
    @IsString()
    productId!: string;
    @IsOptional()
    @IsString()
    variantId?: string;
    @IsNotEmpty()
    @IsNumber()
    quantity!: number;
}