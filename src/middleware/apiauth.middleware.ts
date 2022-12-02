import ApikmsService from '../controllers/apikms/apikms.service';
import Error401Exception from '../exceptions/error401.exception';
import { NextFunction, Request, Response } from 'express';
import * as crypto from 'node:crypto';
import { SuccessResponse } from '../interfaces/response';
import ApiKeyPair from '../models/sql/apiKeyPair.model';

const apiKmsService = new ApikmsService();

async function apiauthMiddleware(
  _request: Request,
  _response: Response,
  next: NextFunction
) {
  const apiKey = _request.header('api-key');
  if (!apiKey) {
    next(new Error401Exception());
    // Make linter happy.
    return;
  }
  let keyPair = await apiKmsService.getApiKeyPair({ apiKey });
  if (keyPair.code !== 200) {
    next(new Error401Exception());
    // Make linter happy.
    return;
  }
  keyPair = keyPair as SuccessResponse<ApiKeyPair>;
  const { apiSecret } = keyPair.data;
  const hmac = crypto.createHmac('sha256', apiSecret);
  const payload = JSON.stringify({
    body: _request.body,
    query: _request.query,
    url: _request.url,
    ts: _request.header('ts'),
  });
  hmac.update(payload);
  const signature = hmac.digest('hex');
  if (signature !== _request.header('signature')) {
    next(new Error401Exception());
    // Make linter happy.
    return;
  }
  next();
}

export default apiauthMiddleware;
