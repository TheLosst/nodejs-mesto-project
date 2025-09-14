import 'express';

import { JwtPayload } from 'jsonwebtoken';
declare module 'express-serve-static-core' {
  interface Request {
    user?: { _id: string } | JwtPayload;
  }
}
