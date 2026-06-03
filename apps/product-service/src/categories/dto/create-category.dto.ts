import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    name!: string;
    @IsOptional()
    @IsString()
    @Length(5, 50)
    description?: string;
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
    @IsOptional()
    @IsString()
    parentCategoryId?: string;
}
