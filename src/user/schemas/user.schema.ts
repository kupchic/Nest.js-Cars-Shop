import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoles } from '../model/enum/user-roles.enum';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  Document,
  ToObjectOptions,
} from 'mongoose';
import { IsOptional } from 'class-validator';
import { Exclude } from 'class-transformer';
import { PRODUCT_CART_COLLECTION_NAME } from '../../product/schemas/product-cart.schema';
import { ProductModel } from '../../product/schemas';

const userOptions: ToObjectOptions = {
  versionKey: false,
  virtuals: true,
  transform: function (doc, user) {
    const { _id, password, refresh_token, ...u } = user;
    return u;
  },
};

export const USERS_COLLECTION_NAME: string = 'usersCollection';

@Schema({
  collection: USERS_COLLECTION_NAME,
  toJSON: userOptions,
  versionKey: false,
})
export class User {
  @Prop({ required: true, type: 'String' })
  firstName: string;

  @Prop({ required: true, type: 'String' })
  lastName: string;

  @Prop({ required: true, type: 'String', unique: true })
  email: string;

  @Prop({ required: true, type: 'String' })
  password: string;

  @Prop({ required: true, type: 'String' })
  phone: string;

  @Prop({
    default: () => [UserRoles.CUSTOMER],
    required: true,
    type: [String],
    enum: UserRoles,
  })
  roles: UserRoles[];

  @Prop({
    default: () => false,
    required: false,
    type: 'Boolean',
  })
  isBlocked: boolean;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: ProductModel.name,
    unique: true,
  })
  cart: string;

  @IsOptional()
  @Exclude()
  @Prop({
    default: () => null,
    required: false,
    type: 'String',
  })
  refresh_token: string;

  id?: string;
}

export const UserSchema: mongoose.Schema<User> =
  SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
export type UserModel = mongoose.Model<UserDocument>;

const UserModel: UserModel = mongoose.model<UserDocument, UserModel>(
  'user',
  UserSchema,
);
export default UserModel;
UserSchema.pre(
  'save',
  async function (
    this: UserDocument,
    next: CallbackWithoutResultAndOptionalError,
  ) {
    const cart: any = await this.$model(PRODUCT_CART_COLLECTION_NAME).create({
      user: this.id,
    });
    this.cart = cart.id;
    next();
  },
);
