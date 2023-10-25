import { PaymentItem } from 'src/modules/payment-items/entities/payment-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum PaymentType {
  CASH = 'cash',
  DEBIT = 'debit',
  CREDIT = 'credit',
  VIRTUALACCOUNT = 'virtual account',
}

@Entity('payment_methods')
@Unique(['name'])
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.CASH,
  })
  payment_type: PaymentType;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(
    (type) => PaymentItem,
    (payment_item) => payment_item.payment_method,
  )
  payment_items: PaymentItem[];
}
