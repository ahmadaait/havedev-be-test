import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSalesItemDto } from '../sales-items/dto/create-sales-item.dto';
import { SalesItem } from '../sales-items/entities/sales-item.entity';
import { User } from '../users/entities/user.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale, SaleStatus } from './entities/sale.entity';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class SalesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SalesItem)
    private salesItemRepository: Repository<SalesItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(createSaleDto: CreateSaleDto, user: User) {
    //start trx
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const sale = this.saleRepository.create(<CreateSaleDto>{
      invoice: '',
      status: SaleStatus.NEW,
      created_by: user,
    });

    await queryRunner.manager.save(sale);
    sale.invoice = `${new Date().toISOString().split('T')[0]}-${sale.id}`;
    await queryRunner.manager.save(sale);

    //create sales items
    let amount = 0;
    for (const item of createSaleDto.salesItems) {
      const product = await this.productRepository.findOne({
        where: {
          id: item.productId,
        },
      });

      if (product && product.stock >= item.qty) {
        const salesItem = this.salesItemRepository.create(<CreateSalesItemDto>{
          sale: sale,
          product: product,
          qty: item.qty,
          price: product.price,
        });
        await queryRunner.manager.save(salesItem);

        amount += item.qty * product.price;

        product.stock -= item.qty;
        await queryRunner.manager.save(product);
      }
    }

    //create payment
    const payment = this.paymentRepository.create(<CreatePaymentDto>{
      invoice: '',
      sale: sale,
      amount: amount,
      status: PaymentStatus.UNPAID,
    });
    await queryRunner.manager.save(payment);
    payment.invoice = `${new Date().toISOString().split('T')[0]}-${payment.id}`;
    await queryRunner.manager.save(payment);

    //commit trx
    await queryRunner.commitTransaction();
    await queryRunner.release();

    return { message: 'success' };
  }

  async findAll(
    options: IPaginationOptions,
    keyword: string,
  ): Promise<Pagination<Sale>> {
    const queryBuilder = this.saleRepository.createQueryBuilder('c');
    queryBuilder.leftJoinAndSelect('c.created_by', 'u');
    queryBuilder.leftJoinAndSelect('c.sales_items', 's');

    if (keyword) {
      queryBuilder.where('c.invoice like :invoice', {
        invoice: `%${keyword}%`,
      });
    }

    queryBuilder.select(['c', 'u', 's']);
    queryBuilder.orderBy('c.created_at', 'DESC');
    return paginate<Sale>(queryBuilder, options);
  }

  async findOne(id: number) {
    const data = await this.saleRepository.findOne({
      where: {
        id,
      },
      relations: {
        created_by: true,
        sales_items: true,
      },
    });
    if (!data) throw new HttpException('Sale not found', 404);

    return { message: 'success', data };
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    //start trx
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['sales_items.product'],
    });

    if (!sale) throw new HttpException('Sale not found', 404);

    if (sale.status !== SaleStatus.NEW)
      throw new HttpException('Invalid status', 400);

    if (
      !(
        updateSaleDto.status === SaleStatus.NEW ||
        updateSaleDto.status === SaleStatus.CANCELED
      )
    )
      throw new HttpException('Invalid status to update items', 400);

    //status canceled
    if (updateSaleDto.status === SaleStatus.CANCELED) {
      for (const salesItem of sale.sales_items) {
        const product = await this.productRepository.findOne({
          where: {
            id: salesItem.product.id,
          },
        });
        if (product) {
          product.stock += salesItem.qty;
          await queryRunner.manager.save(product);
        }
      }

      sale.status = SaleStatus.CANCELED;
      await queryRunner.manager.save(sale);

      const payment = await this.paymentRepository.findOne({
        where: {
          sale: {
            id: sale.id,
          },
        },
      });
      payment.status = PaymentStatus.CANCELED;
      await queryRunner.manager.save(payment);

      //commit trx
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return { message: 'success' };
    }

    if (updateSaleDto.salesItems) {
      const salesItems = await this.salesItemRepository.find({
        where: {
          sale: {
            id: sale.id,
          },
        },
        relations: {
          sale: true,
          product: true,
        },
      });

      //return stock into product
      for (const salesItem of salesItems) {
        const product = await this.productRepository.findOne({
          where: {
            id: salesItem.product.id,
          },
        });
        if (product) {
          product.stock += salesItem.qty;
          await this.productRepository.save(product);
        }
      }

      //destroy salesitems
      await queryRunner.manager.remove(salesItems);

      //create new salesitems
      let amount = 0;
      for (const item of updateSaleDto.salesItems) {
        const product = await this.productRepository.findOne({
          where: {
            id: item.productId,
          },
        });

        if (product && product.stock >= item.qty) {
          const salesItem = this.salesItemRepository.create(<
            CreateSalesItemDto
          >{
            sale: sale,
            product: product,
            qty: item.qty,
            price: product.price,
          });
          await queryRunner.manager.save(salesItem);

          amount += item.qty * product.price;

          product.stock -= item.qty;
          await queryRunner.manager.save(product);
        }
      }

      //update payment
      const payment = await this.paymentRepository.findOne({
        where: {
          sale: {
            id: sale.id,
          },
        },
        relations: {
          sale: true,
        },
      });
      payment.amount = amount;
      await queryRunner.manager.save(payment);
    }

    //commit trx
    await queryRunner.commitTransaction();
    await queryRunner.release();

    return { message: 'success' };
  }

  async remove(id: number) {
    const sale = await this.saleRepository.findOne({
      where: {
        id,
      },
      relations: ['sales_items.product'],
    });
    if (!sale) throw new HttpException('Sale not found', 404);

    if (sale.status !== SaleStatus.NEW)
      throw new HttpException('Invalid status', 400);

    for (const salesItem of sale.sales_items) {
      const product = await this.productRepository.findOne({
        where: {
          id: salesItem.product.id,
        },
      });
      if (product) {
        product.stock += salesItem.qty;
        await this.productRepository.save(product);
      }
    }

    sale.status = SaleStatus.CANCELED;
    await this.saleRepository.save(sale);

    const payment = await this.paymentRepository.findOne({
      where: {
        sale: {
          id: sale.id,
        },
      },
    });
    payment.status = PaymentStatus.CANCELED;
    await this.paymentRepository.save(payment);

    return { message: 'success' };
  }
}
