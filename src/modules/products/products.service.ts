import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product | undefined> {
    return await this.productsRepository.findOne({ where: { id } });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);

    if (product.name.length < 3)
      throw new HttpException('Name must be at least 3 characters', 400);
    if (product.price < 1) throw new HttpException('Invalid price', 400);
    if (product.stock < 1) throw new HttpException('Invalid stock', 400);

    await this.productsRepository.save(product);

    const id = product.id;
    product.code = 'PRD-' + id;

    await this.productsRepository.update(id, product);
    return await this.productsRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product | undefined> {
    await this.productsRepository.update(id, updateProductDto);
    if (updateProductDto.name.length < 3)
      throw new HttpException('Name must be at least 3 characters', 400);
    if (updateProductDto.price < 1)
      throw new HttpException('Invalid price', 400);
    if (updateProductDto.stock < 1)
      throw new HttpException('Invalid stock', 400);
    return this.productsRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<Boolean> {
    const result = await this.productsRepository.delete(id);
    return result.affected === 1;
  }
}
