import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { ManagerModule } from './manager/manager.module';
import { AdminModule } from './admin/admin.module';
import { CustomerModule } from './customer/customer.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/', {
      dbName: 'custom_db_name',
    }),
    AdminModule,
    CustomerModule,
    ManagerModule,
    ProductModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
