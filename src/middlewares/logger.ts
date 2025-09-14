import winston from 'winston';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'request.log') }),
  ],
});

const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'error.log') }),
  ],
});

export function requestLogMiddleware(req: Request, res: Response, next: NextFunction) {
  requestLogger.info({
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
    time: new Date().toISOString(),
  });
  next();
}

export function errorLogMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  errorLogger.error({
    message: err.message,
    status: err.statusCode || 500,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    time: new Date().toISOString(),
  });
  next(err);
}
