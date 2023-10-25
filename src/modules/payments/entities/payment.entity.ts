import { PaymentItem } from 'src/modules/payment-items/entities/payment-item.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PARTIALPAID = 'partial_paid',
  CANCELED = 'canceled',
}

@Entity('payments')
@Unique(['invoice'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne((type) => Sale, (sale) => sale.id)
  @JoinColumn()
  sale: Sale;

  @Column()
  invoice: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  status: PaymentStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany((type) => PaymentItem, (payment_item) => payment_item.payment)
  payment_items: PaymentItem[];
}
