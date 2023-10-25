import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MysqlDefaultService } from './config/mysql-default.service';
import typeormconfig from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { AuthInterceptor } from './modules/interceptor/auth.interceptor';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { SalesItemsModule } from './modules/sales-items/sales-items.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PaymentItemsModule } from './modules/payment-items/payment-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [typeormconfig] }),
    TypeOrmModule.forRootAsync({
      useClass: MysqlDefaultService,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('typeormconfig'),
    }),
    AuthModule,
    UsersModule,
    PaymentMethodsModule,
    ProductsModule,
    SalesModule,
    SalesItemsModule,
    PaymentsModule,
    PaymentItemsModule,
  ],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: AuthInterceptor }],
})
export class AppModule {}
