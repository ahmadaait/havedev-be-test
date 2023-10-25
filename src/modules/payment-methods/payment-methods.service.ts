import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  findAll(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find();
  }

  async findOne(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethodRepository.findOne({ where: { id } });
  }

  async create(
    createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const checkDuplicate = await this.paymentMethodRepository.findOne({
      where: { name: createPaymentMethodDto.name },
    });

    if (checkDuplicate) throw new HttpException('Duplicate', 500);

    const paymentMethod = this.paymentMethodRepository.create(
      createPaymentMethodDto,
    );

    if (paymentMethod.name.length < 3)
      throw new HttpException('Name must be at least 3 characters', 400);

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async update(
    id: number,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod | undefined> {
    const checkDuplicate = await this.paymentMethodRepository.findOne({
      where: { name: updatePaymentMethodDto.name },
    });

    if (checkDuplicate) throw new HttpException('Duplicate', 500);

    await this.paymentMethodRepository.update(id, updatePaymentMethodDto);
    if (updatePaymentMethodDto.name.length < 3)
      throw new HttpException('Name must be at least 3 characters', 400);

    return this.paymentMethodRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<Boolean> {
    const result = await this.paymentMethodRepository.delete(id);
    return result.affected === 1;
  }
}
