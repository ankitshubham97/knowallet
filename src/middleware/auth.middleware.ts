import { NextFunction, Response } from 'express';
import RequestWithOrg from '../interfaces/requestWithOrg.interface';

async function authMiddleware(
  _request: RequestWithOrg,
  _response: Response,
  next: NextFunction
) {
  // TODO(ankit): Implement this.
  next();
}

export default authMiddleware;
