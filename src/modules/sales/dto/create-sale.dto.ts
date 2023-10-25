import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';
import { SaleStatus } from '../entities/sale.entity';

export class CreateSaleDto {
  id?: number;

  created_by: User;

  @IsString()
  invoice: string;

  @IsEnum(SaleStatus)
  status: SaleStatus;

  @IsNotEmpty()
  salesItems: salesItemsDto[];
}

class salesItemsDto {
  @IsNumber()
  qty: number;

  @IsNumber()
  productId: number;
}
