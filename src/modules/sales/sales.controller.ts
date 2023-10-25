import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SalesService } from './sales.service';

@Controller('sales')
@ApiTags('sales')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        salesItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'number' },
              qty: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async create(@Body() createSaleDto: CreateSaleDto, @Res() res) {
    const user = res.locals['user'].id;
    const data = await this.salesService.create(createSaleDto, user);
    return res.status(201).json(data);
  }

  @Get()
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('keyword') keyword: string,
  ) {
    return this.salesService.findAll(
      {
        page: page,
        limit: limit,
      },
      keyword,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
        },
        salesItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'number' },
              qty: { type: 'number' },
            },
          },
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
