// PATCH /users/me — обновляет профиль
export async function updateProfile(req: Request, res: Response) {
  const userId = req.user?._id;
  const { name, about } = req.body || {};
  if (!name || !about) {
    return res.status(400).json({ message: 'Переданы некорректные данные для обновления профиля' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с указанным _id не найден' });
    }
    res.status(200).json(user);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Переданы некорректные данные для обновления профиля' });
    }
  res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}

// PATCH /users/me/avatar — обновляет аватар
export async function updateAvatar(req: Request, res: Response) {
  const userId = req.user?._id;
  const { avatar } = req.body || {};
  if (!avatar) {
    return res.status(400).json({ message: 'Переданы некорректные данные для обновления аватара' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с указанным _id не найден' });
    }
    res.status(200).json(user);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Переданы некорректные данные для обновления аватара' });
    }
  res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../models/user';

// GET /users — возвращает всех пользователей
export async function getUsers(req: Request, res: Response) {
  try {
    const users: IUser[] = await User.find({}).exec();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}

// GET /users/:userId — возвращает пользователя по _id
export async function getUserById(req: Request, res: Response) {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Передан некорректный _id пользователя' });
  }
  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: 'Пользователь по указанному _id не найден' });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}

// POST /users — создаёт пользователя
export async function createUser(req: Request, res: Response) {
  const { name, about, avatar } = req.body || {};
  try {
    const user = await User.create({ name, about, avatar });
    return res.status(201).json(user);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Переданы некорректные данные при создании пользователя' });
    }
    return res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}
