import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/auth/schemas/user';
@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ unique: [true, 'duplicate client name entered'] })
  clientName: string;
  @Prop()
  gistin: string;
  @Prop()
  pancardNo: string;
  @Prop()
  contactNo: string;
  @Prop({ type: Object })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
  @Prop()
  sameState: boolean;
  @Prop({ type: [String] })
  email: string[];

  @Prop({ default: 'active', enum: ['active', 'inactive'] }) // New field
  isActive: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
