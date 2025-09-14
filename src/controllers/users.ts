
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';

// GET /users — возвращает всех пользователей
export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users: IUser[] = await User.find({}).exec();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

// GET /users/:userId — возвращает пользователя по _id
export async function getUserById(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next({ statusCode: 400, message: 'Передан некорректный _id пользователя' });
  }
  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      return next({ statusCode: 404, message: 'Пользователь по указанному _id не найден' });
    }
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

// POST /signup — регистрация
export async function createUser(req: Request, res: Response, next: NextFunction) {
  const { name, about, avatar, email, password } = req.body || {};
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, about, avatar, email, password: hash });
    // Не возвращаем пароль
    const userObj = user.toObject();
    delete userObj.password;
    return res.status(201).json(userObj);
  } catch (err: any) {
    next(err);
  }
}

// POST /signin — логин
export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next({ statusCode: 401, message: 'Неправильные почта или пароль' });
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return next({ statusCode: 401, message: 'Неправильные почта или пароль' });
    }
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
}

// PATCH /users/me — обновляет профиль
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?._id;
  const { name, about } = req.body || {};
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true }
    );
    if (!user) {
      return next({ statusCode: 404, message: 'Пользователь с указанным _id не найден' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

// PATCH /users/me/avatar — обновляет аватар
export async function updateAvatar(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?._id;
  const { avatar } = req.body || {};
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true }
    );
    if (!user) {
      return next({ statusCode: 404, message: 'Пользователь с указанным _id не найден' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
