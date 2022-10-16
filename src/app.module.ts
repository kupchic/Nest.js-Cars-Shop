import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { ManagerModule } from './manager/manager.module';
import { AdminModule } from './admin/admin.module';
import { CustomerModule } from './customer/customer.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    AdminModule,
    CustomerModule,
    ManagerModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
