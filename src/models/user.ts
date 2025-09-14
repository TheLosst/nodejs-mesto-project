import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  about: string;
  avatar: string;
}

const urlRegex = /^(https?:\/\/)(www\.)?[\w\-~:/?#@!$&'()*+,;=.]+#?$/i; // простой паттерн, можно усилить позже

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    trim: true,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 200,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => urlRegex.test(v),
      message: 'Invalid avatar URL',
    },
  },
}, {
  versionKey: false,
});

const User: Model<IUser> = mongoose.model<IUser>('user', userSchema);
export default User;
