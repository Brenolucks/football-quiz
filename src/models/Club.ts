import { Schema, model } from 'mongoose';
import { IClub } from '../interfaces/IClub';

const ClubSchema = new Schema<IClub>({
  clubName: {
    type: String,
    required: [true, 'Name of the club is required'],
    maxlength: [20, 'Name cannot exceed 20 characters']
  },
  clubBadgeUrl: {
    type: String,
    /*required: [true, 'Club URL is required'],*/
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add indexes for better performance
ClubSchema.index({ name: 'text' }); // text index for search

export default model<IClub>('Club', ClubSchema);