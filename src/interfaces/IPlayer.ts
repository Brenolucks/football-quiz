import { Document, Types } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  clubs: Types.ObjectId[];
}