import { PaymentItem } from 'src/modules/payment-items/entities/payment-item.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at?: Date;

  @OneToMany((type) => Sale, (sale) => sale.created_by)
  sales: Sale[];

  @OneToMany((type) => PaymentItem, (payment_item) => payment_item.created_by)
  payment_items: PaymentItem[];
}
