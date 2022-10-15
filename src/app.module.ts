import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { ManagerModule } from './manager/manager.module';
import { AdminModule } from './admin/admin.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://admin:admin@localhost:5000', {
    //   dbName: 'custom_db_name',
    // }),
    AdminModule,
    CustomerModule,
    ManagerModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
