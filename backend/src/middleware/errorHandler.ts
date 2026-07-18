import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { config } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Handle SyntaxError (malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }

  console.error('[Unhandled Exception]', err);

  const response: any = { error: 'Internal server error' };
  if (config.nodeEnv === 'development') {
    response.details = err.message || err;
    response.stack = err.stack;
  }

  return res.status(500).json(response);
};
