import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoles } from '../model/enum/user-roles.enum';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  Document,
  ToObjectOptions,
} from 'mongoose';
import { IsOptional } from 'class-validator';
import { Exclude } from 'class-transformer';
import 'dotenv/config';
import { CollectionsName, ModelName } from '../../common/model';

const userOptions: ToObjectOptions = {
  versionKey: false,
  virtuals: true,
  transform: function (doc, user) {
    const { _id, password, refresh_token, ...u } = user;
    return u;
  },
};

@Schema({
  collection: CollectionsName.USERS,
  toJSON: userOptions,
  versionKey: false,
  virtuals: true,
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
    ref: () => ModelName.PRODUCT_CART,
    unique: true,
  })
  cart: string;

  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: () => ModelName.ORDER,
    default: () => [],
  })
  orders: string[];

  @IsOptional()
  @Exclude()
  @Prop({
    default: () => null,
    required: false,
    type: 'String',
  })
  refresh_token?: string;

  id?: string;
}

export const UserSchema: mongoose.Schema<User> =
  SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
export type UserModel = mongoose.Model<UserDocument>;

UserSchema.pre(
  'save',
  async function (next: CallbackWithoutResultAndOptionalError) {
    const cart: any = await this.$model(ModelName.PRODUCT_CART).create({
      user: this.id,
    });
    this.cart = cart.id;
    next();
  },
);

UserSchema.pre(
  'findOne',
  function (next: CallbackWithoutResultAndOptionalError) {
    this.populate('cart');
    next();
  },
);

UserSchema.pre(
  /^(findOneAndDelete|deleteOne)/,
  async function (next: CallbackWithoutResultAndOptionalError) {
    const user: UserDocument = await this.model.findOne(this.getFilter());
    await this.model.db
      .model(ModelName.PRODUCT_CART)
      .findByIdAndDelete(user.cart);
    next();
  },
);

UserSchema.pre(
  'deleteMany',
  async function (next: CallbackWithoutResultAndOptionalError) {
    const filter: mongoose.FilterQuery<any> = {
      user: this.getFilter()._id,
    };
    await this.model.db.model(ModelName.PRODUCT_CART).deleteMany(filter);
    next();
  },
);
