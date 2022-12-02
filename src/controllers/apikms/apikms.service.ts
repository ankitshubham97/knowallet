import logger from '../../services/logger';
import * as crypto from 'node:crypto';
import * as util from 'node:util';
import { sequelize } from '../../models/sql/sequelize';

import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from '../../constants';
import ApiResponse, {
  createFailureResponse,
  createFailureResponseData,
  createSuccessResponse,
} from '../../interfaces/response';
import GenerateApiKeyDto from './dto/generateApiKey.dto';
import ApiKeyPair from '../../models/sql/apiKeyPair.model';

class ApikmsService {
  public apiKeyPairRepository = sequelize.getRepository(ApiKeyPair);

  public async generateApiKey({ payload }: { payload: GenerateApiKeyDto }) {
    try {
      /**
       * 1. Generate ED25519 key pairs.
       * 2. Store the pub key as api key. Also store the access, expiry and ipwhitelist(if any).
       * 3. Send both the pub and pvt keys in response.
       */
      const generateApiKeyPairResponse = await this.generateApiKeyPair();
      if (generateApiKeyPairResponse.error) {
        return generateApiKeyPairResponse;
      }
      if (
        !(
          generateApiKeyPairResponse.data?.apiKey &&
          generateApiKeyPairResponse.data?.apiSecret
        )
      ) {
        return createFailureResponse(400, INVALID_REQUEST);
      }
      const { apiKey, apiSecret } = generateApiKeyPairResponse.data;
      const { orgId, access, ipWhitelist, expiryEpochSeconds } = payload;
      // @ts-ignore
      await this.apiKeyPairRepository.create({
        orgId,
        apiKey,
        apiSecret,
        expiryEpochSeconds,
        ipWhitelist: ipWhitelist?.join(','),
        access: access,
      });
      return createSuccessResponse({
        apiKey,
        apiSecret,
        expiryEpochSeconds,
        ipWhitelist,
        access,
      });
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }

  public async getApiKeyPair({
    apiKey,
  }: {
    apiKey: string;
  }): Promise<ApiResponse<ApiKeyPair>> {
    try {
      const keyPair = await this.apiKeyPairRepository.findOne({
        where: {
          apiKey,
        },
      });
      if (!keyPair) {
        return createFailureResponse(
          404,
          `Key pair for api key ${apiKey} not found`
        );
      }
      return createSuccessResponse(keyPair);
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }

  public async deleteApiKey({
    apiKey,
    orgId,
  }: {
    apiKey: string;
    orgId: string;
  }) {
    try {
      const numDeleted = await this.apiKeyPairRepository.destroy({
        where: {
          apiKey,
          orgId,
        },
      });
      return createSuccessResponse({
        numDeleted,
      });
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }

  public async rotateApiKey({
    apiKey,
    orgId,
  }: {
    apiKey: string;
    orgId: string;
  }) {
    try {
      const generateApiKeyPairResponse = await this.generateApiKeyPair();
      if (generateApiKeyPairResponse.error) {
        return generateApiKeyPairResponse;
      }
      if (
        !(
          generateApiKeyPairResponse.data?.apiKey &&
          generateApiKeyPairResponse.data?.apiSecret
        )
      ) {
        return createFailureResponse(400, INVALID_REQUEST);
      }
      const { apiKey: newApiKey, apiSecret: newApiSecret } =
        generateApiKeyPairResponse.data;
      const apiKeyRecord = await this.apiKeyPairRepository.findOne({
        where: {
          apiKey,
          orgId,
        },
      });
      if (!apiKeyRecord) {
        return createFailureResponseData(
          400,
          INVALID_REQUEST,
          `Cannot find api key ${apiKey}`
        );
      }
      const { access, ipWhitelist, expiryEpochSeconds } = apiKeyRecord;

      let updatedSucceeded = false;
      const t = await sequelize.transaction();

      try {
        // @ts-ignore
        await this.apiKeyPairRepository.create({
          orgId,
          apiKey: newApiKey,
          apiSecret: newApiSecret,
          expiryEpochSeconds,
          ipWhitelist,
          access: access,
        });
        await this.apiKeyPairRepository.destroy({
          where: {
            apiKey,
            orgId,
          },
        });
        await t.commit();
        updatedSucceeded = true;
      } catch (e) {
        await t.rollback();
        logger.error(`db txn rollbacked for orgId ${orgId}`);
      }

      return updatedSucceeded
        ? createSuccessResponse({
            newApiKey,
            newApiSecret,
            expiryEpochSeconds,
            ipWhitelist,
            access,
          })
        : createFailureResponse(500, INTERNAL_SERVER_ERROR);
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }

  public async updateAccess({
    apiKey,
    access,
    orgId,
  }: {
    apiKey: string;
    access: number;
    orgId: string;
  }) {
    try {
      const apiKeyRecord = await this.apiKeyPairRepository.findOne({
        where: {
          apiKey,
          orgId,
        },
      });
      if (!apiKeyRecord) {
        return createFailureResponseData(
          400,
          INVALID_REQUEST,
          `Cannot find api key ${apiKey}`
        );
      }
      const oldAccess = Number(apiKeyRecord.access);
      if (oldAccess === access) {
        return createFailureResponseData(
          400,
          INVALID_REQUEST,
          `New access is the same as the stored access`
        );
      }
      const updateResponse = await this.apiKeyPairRepository.update(
        {
          access,
        },
        {
          where: {
            apiKey,
            orgId,
          },
        }
      );
      if (updateResponse[0] === 0) {
        return createFailureResponseData(
          400,
          INVALID_REQUEST,
          `Cannot find api key ${apiKey}`
        );
      }
      if (updateResponse[0] > 1) {
        logger.error(`More than 1 records found for api key ${apiKey}`);
        return createFailureResponse(500, INTERNAL_SERVER_ERROR);
      }
      return createSuccessResponse({
        apiKey,
        oldAccess,
        newAccess: access,
      });
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }

  public async generateApiKeyPair() {
    try {
      const generateKeyPair = util.promisify(crypto.generateKeyPair);
      const keypair = await generateKeyPair('ed25519', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });
      const apiKey = String(keypair.publicKey)
        .replace('-----BEGIN PUBLIC KEY-----\n', '')
        .replace('\n-----END PUBLIC KEY-----\n', '');
      const apiSecret = String(keypair.privateKey)
        .replace('-----BEGIN PRIVATE KEY-----\n', '')
        .replace('\n-----END PRIVATE KEY-----\n', '');
      return createSuccessResponse({
        apiKey,
        apiSecret,
      });
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }
}

export default ApikmsService;
