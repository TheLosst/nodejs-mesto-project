import mongoose, { Schema, Document, Model } from 'mongoose';
import validator from 'validator';

export interface IUser extends Document {
  name: string;
  about: string;
  avatar: string;
  email: string;
  password: string;
}

// https://regex101.com/r/1XUuQ2/1
const urlRegex = /^(https?:\/\/)(www\.)?([\w-]+\.)+[a-zA-Z]{2,}(\/[-\w._~:/?#[\]@!$&'()*+,;=]*)?#?$/;

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    trim: true,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 200,
    trim: true,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator: (v: string) => urlRegex.test(v),
      message: 'Invalid avatar URL',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, {
  versionKey: false,
});

const User: Model<IUser> = mongoose.model<IUser>('user', userSchema);
export default User;
