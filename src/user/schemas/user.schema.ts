import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoles } from '../model/enum/user-roles.enum';
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
  @Prop({ required: true, type: 'String' })
  firstName: string;

  @Prop({ required: true, type: 'String' })
  lastName: string;

  @Prop({ required: true, type: 'String' })
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
