import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AdminModule,
    // MongooseModule.forRoot('mongodb://localhost/store'),
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
