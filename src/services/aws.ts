import AWS from 'aws-sdk';
import AbstractService from './service';
import EnvService from './env';
import logger from './logger';

export type EmailCampaigns = 'CS' | 'MUSIC' | 'OPS' | 'RENEWAL' | 'INDIVIDUAL';

export type SESConfigurationSet =
  | 'ses-growth-pool-1'
  | 'ses-growth-pool-2'
  | 'ses-transactional';

export type EmailNotification = {
  to: string[];
  from: string;
  configSet: SESConfigurationSet;
  ccList?: string[];
  bccList?: string[];
  replyToAddresses?: string[];
};

// @ts-ignore
const campaignMap: {
  [key in EmailCampaigns]: EmailNotification;
} = {
  CS: {
    to: ['cs@allround.club'],
    from: 'classes@allround.club',
    configSet: 'ses-transactional',
    ccList: [],
  },
  MUSIC: {
    to: ['jay@allround.club'],
    from: 'classes@allround.club',
    configSet: 'ses-transactional',
    ccList: [
      'arpit@allround.club',
      'shetty@allround.club',
      'riya@allround.club',
      'jay@allround.club',
    ],
  },
  OPS: {
    to: ['cs@allround.club', 'rohan@allround.club'],
    from: 'classes@allround.club',
    configSet: 'ses-transactional',
    ccList: [],
  },
  RENEWAL: {
    to: ['renewal@allround.club', 'cs@allround.club'],
    from: 'classes@allround.club',
    configSet: 'ses-transactional',
    ccList: [],
  },
  INDIVIDUAL: {
    to: [],
    from: 'classes@allround.club',
    configSet: 'ses-transactional',
    ccList: [],
  },
};

class AWSService implements AbstractService {
  static init(): void {
    const config = AWS.config;

    if (!config.accessKeyId || !config.secretAccessKey || !config.region) {
      // Set region
      AWS.config.update({
        accessKeyId: EnvService.env().AWS_KEY,
        secretAccessKey: EnvService.env().AWS_SECRET,
        region: EnvService.env().AWS_REGION,
      });

      logger.info('Finished setting up AWS service');
    }
  }

  public async checkIfS3KeyExists(
    s3Bucket: string,
    s3Key: string
  ): Promise<boolean> {
    try {
      const s3 = new AWS.S3();
      const keyExists = await s3
        .headObject({
          Bucket: s3Bucket,
          Key: s3Key,
        })
        .promise();
      if (keyExists) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

}

export default AWSService;
