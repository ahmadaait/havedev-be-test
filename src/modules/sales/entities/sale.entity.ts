import { Payment } from 'src/modules/payments/entities/payment.entity';
import { SalesItem } from 'src/modules/sales-items/entities/sales-item.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum SaleStatus {
  NEW = 'new',
  PAYMENTPROCESS = 'payment_process',
  DONE = 'done',
  CANCELED = 'canceled',
}

@Entity('sales')
@Unique(['invoice'])
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User, (user) => user.sales)
  created_by: User;

  @Column()
  invoice: string;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.NEW,
  })
  status: SaleStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany((type) => SalesItem, (sales_item) => sales_item.sale)
  sales_items: SalesItem[];
}
