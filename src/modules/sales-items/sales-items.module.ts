import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesItem } from './entities/sales-item.entity';
@Module({
  imports: [TypeOrmModule.forFeature([SalesItem])],
})
export class SalesItemsModule {}
