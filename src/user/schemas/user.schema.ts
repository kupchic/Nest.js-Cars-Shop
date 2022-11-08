import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoles } from '../entities/user-roles.enum';
import mongoose, { Document, ToObjectOptions } from 'mongoose';
import { IsOptional } from 'class-validator';
import { Exclude } from 'class-transformer';

const userOptions: ToObjectOptions = {
  versionKey: false,
  virtuals: true,
  transform: function (doc, user) {
    const { _id, password, refresh_token, ...u } = user;
    return u;
  },
};

@Schema({ toJSON: userOptions })
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop({
    default: () => [UserRoles.CUSTOMER],
  })
  roles: [UserRoles];

  @Prop({
    default: () => false,
  })
  isBlocked: boolean;

  @IsOptional()
  @Exclude()
  @Prop({
    default: () => null,
  })
  refresh_token: string;

  @IsOptional()
  @Exclude()
  id?: string;
}

export const UserSchema: mongoose.Schema<User> =
  SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
