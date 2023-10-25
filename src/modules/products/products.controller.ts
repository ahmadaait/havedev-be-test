import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@Controller('products')
@ApiTags('Products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Authorization')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    return await this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Product | undefined> {
    return await this.productsService.findOne(id);
  }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        stock: { type: 'number' },
        price: { type: 'number' },
      },
    },
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Res() res,
  ): Promise<Product> {
    const data = await this.productsService.create(createProductDto);

    return res.status(201).json({ message: 'success', data: data });
  }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        stock: { type: 'number' },
        price: { type: 'number' },
      },
    },
  })
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Res() res,
  ): Promise<Product | undefined> {
    const data = await this.productsService.update(id, updateProductDto);

    return res.status(200).json({ message: 'success', data: data });
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ success: Boolean }> {
    const success = await this.productsService.remove(id);
    return { success };
  }
}
