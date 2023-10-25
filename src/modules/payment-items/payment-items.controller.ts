import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreatePaymentItemDto } from './dto/create-payment-item.dto';
import { PaymentItemsService } from './payment-items.service';

@Controller('payment-items')
@ApiTags('Payment Items')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard)
export class PaymentItemsController {
  constructor(private readonly paymentItemsService: PaymentItemsService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payment_id: { type: 'number' },
        payment_method_id: { type: 'number' },
        payment_total: { type: 'number' },
      },
    },
  })
  async create(@Body() createPaymentItemDto: CreatePaymentItemDto, @Res() res) {
    const user = res.locals['user'].id;
    const data = await this.paymentItemsService.create(
      createPaymentItemDto,
      user,
    );
    return res.status(201).json(data);
  }
}
