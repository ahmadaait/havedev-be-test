import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesItem } from '../sales-items/entities/sales-item.entity';
import { Product } from '../products/entities/product.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SalesItem, Product, Payment])],
  exports: [SalesService],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
