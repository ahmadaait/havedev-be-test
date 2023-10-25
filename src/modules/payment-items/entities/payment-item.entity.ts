import { PaymentMethod } from 'src/modules/payment-methods/entities/payment-method.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('payment_items')
@Unique(['invoice'])
export class PaymentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @ManyToOne((type) => Payment, (payment) => payment.payment_items)
  payment: Payment;

  @ManyToOne(
    (type) => PaymentMethod,
    (payment_method) => payment_method.payment_items,
  )
  payment_method: PaymentMethod;

  @ManyToOne((type) => User, (user) => user.payment_items)
  created_by: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  payment_total: number;

  @Column()
  invoice: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
