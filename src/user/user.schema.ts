import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoles } from './entities/user-roles.enum';

@Schema()
export class User {
  // extends RegisterDto ??
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
  userRole: UserRoles;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
