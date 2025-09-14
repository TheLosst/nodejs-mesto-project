import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICard extends Document {
  name: string;
  link: string;
  owner: Types.ObjectId;
  likes: Types.ObjectId[];
  createdAt: Date;
}

// https://regex101.com/r/1XUuQ2/1
const urlRegex = /^(https?:\/\/)(www\.)?([\w-]+\.)+[a-zA-Z]{2,}(\/[-\w._~:/?#[\]@!$&'()*+,;=]*)?#?$/;

const cardSchema = new Schema<ICard>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    trim: true,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => urlRegex.test(v),
      message: 'Invalid link URL',
    },
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
}, {
  versionKey: false,
});

const Card: Model<ICard> = mongoose.model<ICard>('card', cardSchema);
export default Card;
