import { SalesItem } from 'src/modules/sales-items/entities/sales-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('products')
@Unique(['code'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  code: string;

  @Column()
  name: string;

  @Column({ default: 1 })
  stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany((type) => SalesItem, (sales_item) => sales_item.product)
  sales_items: SalesItem[];
}
