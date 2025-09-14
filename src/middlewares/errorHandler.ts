import { Request, Response, NextFunction } from 'express';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // celebrate/joi validation error
  if (err.isJoi || err.joi) {
    return res.status(400).json({ message: err.details?.[0]?.message || 'Ошибка валидации' });
  }
  // кастомные ошибки с statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  // Mongo duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
  }
  // JWT error
  if (err.name === 'JsonWebTokenError' || err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Необходима авторизация' });
  }
  // mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Переданы некорректные данные' });
  }
  // mongoose cast error (ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Передан некорректный id' });
  }
  // fallback
  return res.status(500).json({ message: 'Ошибка по умолчанию' });
}
