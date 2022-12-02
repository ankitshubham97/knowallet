import '../utils/loadEnv';

import EnvService from '../services/env';
EnvService.init();

import ApikmsService from '../controllers/apikms/apikms.service';
import logger from '../services/logger';
import * as crypto from 'node:crypto';
import { SuccessResponse } from '../interfaces/response';
import ApiKeyPair from '../models/sql/apiKeyPair.model';

async function main() {
  const apiKmsService = new ApikmsService();
  let keyPair = await apiKmsService.getApiKeyPair({
    apiKey: 'dummy-api-key', // replace this with a real api key while testing this tool
  });
  if (keyPair.code !== 200) {
    logger.error('Error');
    return;
  }
  keyPair = keyPair as SuccessResponse<ApiKeyPair>;
  const { apiSecret } = keyPair.data;
  const hmac = crypto.createHmac('sha256', apiSecret);
  const body = {
    k1: 'v1',
    k2: 'v2',
  };
  const query = {
    q1: 'v1',
    q2: 'v2',
  };
  // Note: You will need to update the following payload according to your use-case; this is just a sample.
  hmac.update(
    JSON.stringify({
      body,
      query,
      url: '/api/v1/asset?q1=v1&q2=v2',
      ts: '1234',
    })
  );
  const signature = hmac.digest('hex');
  logger.info(signature);
}

main();
