import { Product } from 'src/modules/products/entities/product.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sales_items')
export class SalesItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Sale, (sale) => sale.sales_items)
  sale: Sale;

  @ManyToOne((type) => Product, (product) => product.sales_items)
  product: Product;

  @Column({ default: 1 })
  qty: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
