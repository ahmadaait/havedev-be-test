import { Product } from 'src/modules/products/entities/product.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';

export class CreateSalesItemDto {
  sale: Sale;

  product: Product;

  qty: number;

  price: number;
}
