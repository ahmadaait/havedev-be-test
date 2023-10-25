import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentItemDto } from './dto/create-payment-item.dto';
import { PaymentItem } from './entities/payment-item.entity';
import { Sale, SaleStatus } from '../sales/entities/sale.entity';

@Injectable()
export class PaymentItemsService {
  constructor(
    @InjectRepository(PaymentItem)
    private paymentItemsRepository: Repository<PaymentItem>,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Sale) private saleRepositoy: Repository<Sale>,
  ) {}

  async create(createPaymentItemDto: CreatePaymentItemDto, user: User) {
    if (createPaymentItemDto.payment_total <= 0)
      throw new HttpException('Invalid payment total, min is 1', 400);

    const payment = await this.paymentRepository.findOne({
      where: {
        id: createPaymentItemDto.payment_id,
      },
      relations: {
        sale: true,
      },
    });

    if (!payment) throw new HttpException('Payment not found', 404);

    if (
      payment.status === PaymentStatus.CANCELED ||
      payment.status === PaymentStatus.PAID
    )
      throw new HttpException('Invalid payment status', 400);

    const totalAmountNow = await this.totalAmountNow(payment.id);
    const newAmount = totalAmountNow + createPaymentItemDto.payment_total;

    if (newAmount > payment.amount)
      throw new HttpException(
        `Invalid payment total, max is ${payment.amount - totalAmountNow}`,
        400,
      );

    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: {
        id: createPaymentItemDto.payment_method_id,
      },
    });

    if (!paymentMethod)
      throw new HttpException('Payment method not found', 404);

    const paymentItem = this.paymentItemsRepository.create(<PaymentItem>{
      date: new Date(),
      payment: payment,
      payment_method: paymentMethod,
      created_by: user,
      payment_total: createPaymentItemDto.payment_total,
      invoice: '',
    });

    await this.paymentItemsRepository.save(paymentItem);
    paymentItem.invoice = `${new Date().toISOString().split('T')[0]}-${
      paymentItem.id
    }`;

    await this.paymentItemsRepository.save(paymentItem);

    //update status
    const sale = await this.saleRepositoy.findOne({
      where: {
        id: payment.sale.id,
      },
    });

    if (newAmount === payment.amount * 1) {
      payment.status = PaymentStatus.PAID;
      sale.status = SaleStatus.DONE;
    } else {
      payment.status = PaymentStatus.PARTIALPAID;
      sale.status = SaleStatus.PAYMENTPROCESS;
    }

    await this.paymentRepository.save(payment);
    await this.saleRepositoy.save(sale);

    return { message: 'Payment item created' };
  }

  async totalAmountNow(paymentId: number) {
    const paymentItems = await this.paymentItemsRepository.find({
      relations: {
        payment: true,
      },
      where: {
        payment: {
          id: paymentId,
        },
      },
    });

    let totalPaymentItems = 0;
    for (const paymentItem of paymentItems) {
      totalPaymentItems += paymentItem.payment_total * 1;
    }

    return totalPaymentItems;
  }
}
