import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import express from 'express';
import HttpException from '../exceptions/http.exception';

import logger from '../services/logger';

function validationMiddleware(
  cls: ClassConstructor<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  skipMissingProperties = false
): express.RequestHandler {
  return (req, _res, next) => {
    validate(plainToClass(cls, req.body), { skipMissingProperties }).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) =>
              Object.values(error?.constraints || [])
            )
            .join(', ');
          logger.error(JSON.stringify(message));
          next(new HttpException(400, message));
        } else {
          next();
        }
      }
    );
  };
}

export default validationMiddleware;
