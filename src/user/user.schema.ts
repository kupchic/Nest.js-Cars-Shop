import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoles } from './entities/user-roles.enum';
import mongoose, { Document } from 'mongoose';

@Schema()
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

  @Prop()
  roles: [UserRoles];
}

export const UserSchema: mongoose.Schema<User> =
  SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
