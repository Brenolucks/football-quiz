import { Schema, model } from 'mongoose';
import { IPlayer } from '../interfaces/IPlayer';

const PlayerSchema = new Schema<IPlayer>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [30, 'Name cannot exceed 30 characters']
  },
  clubs: [{
    type: Schema.Types.ObjectId,
    ref: 'Club', // This links to the Club model
    required: true
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add indexes for better performance
PlayerSchema.index({ clubs: 1 });
PlayerSchema.index({ name: 'text' }); // text index for search

export default model<IPlayer>('Player', PlayerSchema);