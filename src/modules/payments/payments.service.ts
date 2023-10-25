import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { DataSource, Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
  ) {}

  async findAll(
    options: IPaginationOptions,
    keyword: string,
  ): Promise<Pagination<Payment>> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('c');
    queryBuilder.leftJoinAndSelect('c.sale', 'u');
    queryBuilder.leftJoinAndSelect('c.payment_items', 's');

    if (keyword) {
      queryBuilder.where('c.invoice like :invoice', {
        invoice: `%${keyword}%`,
      });
    }

    queryBuilder.select(['c', 'u', 's']);
    queryBuilder.orderBy('c.created_at', 'DESC');
    return paginate<Payment>(queryBuilder, options);
  }

  async findOne(id: number) {
    const data = await this.paymentRepository.findOne({
      where: {
        id,
      },
      relations: {
        sale: true,
        payment_items: true,
      },
    });

    if (!data) throw new HttpException('Payment not found', 404);

    return { message: 'success', data };
  }
}
