import { Document } from 'mongoose';

export interface IClub extends Document {
  clubName: string;
  clubBadgeUrl: string;
}