import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
@ApiTags('Payment Methods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Authorization')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  async findAll(): Promise<PaymentMethod[]> {
    return this.paymentMethodsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethodsService.findOne(id);
  }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        payment_type: { enum: ['cash', 'debit', 'credit', 'virtual account'] },
      },
    },
  })
  async create(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
    @Res() res,
  ): Promise<PaymentMethod> {
    const data = await this.paymentMethodsService.create(
      createPaymentMethodDto,
    );

    return res.status(201).json({ message: 'success', data: data });
  }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        payment_type: { enum: ['cash', 'debit', 'credit', 'virtual account'] },
      },
    },
  })
  async update(
    @Param('id') id: number,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    @Res() res,
  ): Promise<PaymentMethod | undefined> {
    const data = await this.paymentMethodsService.update(
      id,
      updatePaymentMethodDto,
    );

    return res.status(200).json({ message: 'success', data: data });
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ success: Boolean }> {
    const success = await this.paymentMethodsService.remove(id);
    return { success };
  }
}
