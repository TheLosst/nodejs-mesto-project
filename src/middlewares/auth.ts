import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function auth(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next({ statusCode: 401, message: 'Необходима авторизация' });
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
  } catch (err) {
    return next({ statusCode: 401, message: 'Необходима авторизация' });
  }
  if (typeof payload !== 'object' || !payload || !('_id' in payload)) {
    return next({ statusCode: 401, message: 'Необходима авторизация' });
  }
  req.user = payload as { _id: string };
  return next();
}
