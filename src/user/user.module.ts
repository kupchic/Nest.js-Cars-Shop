import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { USERS_COLLECTION_NAME, UserSchema } from './schemas';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [
    MongooseModule.forFeature([
      { name: USERS_COLLECTION_NAME, schema: UserSchema },
    ]),
  ],
})
export class UserModule {}
