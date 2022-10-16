import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { ManagerModule } from './manager/manager.module';
import { AdminModule } from './admin/admin.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [AdminModule, CustomerModule, ManagerModule, ProductModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
