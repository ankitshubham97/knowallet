import { SQS } from 'aws-sdk';

import AWSService from './aws';
import EnvService from './env';
import logger, { prettyJSON } from './logger';

export type QueueReturn = {
  MessageId: string | undefined;
  ReceiptHandle: string;
  id: string;
  group: string;
  data: string;
};

export enum QUEUE_GROUPS {
  BASHER = 'basher',
}

export type QUEUES =
  | 'basher';

abstract class Queue {
  abstract enqueueTypedMessage<T>(
    id: string,
    group: QUEUE_GROUPS,
    queue: QUEUES,
    data: T
  ): Promise<void>;

  abstract dequeueMessage(queue: QUEUES): Promise<QueueReturn[]>;

  abstract deleteMessage(id: string, queue: QUEUES): Promise<void>;
}

export class AWSQueue extends AWSService implements Queue {
  private client: SQS;

  static queueMap = {
    basher: EnvService.env().AWS_QUEUE,
  };

  constructor() {
    super();
    this.client = new SQS();

    logger.info(`Using queue ${prettyJSON(AWSQueue.queueMap)}`);
  }

  public enqueueTypedMessage = async <T>(
    id: string,
    group: QUEUE_GROUPS,
    queue: QUEUES,
    data: T
  ) => {
    return await this.enqueueMessage(id, group, queue, JSON.stringify(data));
  };

  private enqueueMessage = async (
    id: string,
    group: QUEUE_GROUPS,
    queue: QUEUES,
    data: string
  ) => {
    const params = {
      MessageAttributes: {
        id: {
          DataType: 'String',
          StringValue: id,
        },
        group: {
          DataType: 'String',
          StringValue: group,
        },
      },
      MessageGroupId: group,
      MessageBody: data || '{}',
      QueueUrl: AWSQueue.queueMap[queue],
    };

    const result = await this.client.sendMessage(params).promise();
    if (result.MessageId) {
      logger.info(`Appended to ${group} - ${id} with id ${result.MessageId}`);
    } else {
      logger.error(`Could not append to queue ${group} - ${id}`);
    }
  };

  public dequeueMessage = async (queue: QUEUES) => {
    const params = {
      MessageAttributeNames: ['id', 'group'],
      QueueUrl: AWSQueue.queueMap[queue],
      MaxNumberOfMessages: 10,
    };

    const result = await this.client.receiveMessage(params).promise();

    if (result.Messages) {
      const results = [];
      for (const message of result.Messages) {
        results.push({
          MessageId: message.MessageId!,
          ReceiptHandle: message.ReceiptHandle!,
          id: message.MessageAttributes?.id.StringValue ?? '',
          group: message.MessageAttributes?.group.StringValue ?? '',
          data: message.Body || '{}',
        });
      }

      return results;
    }

    return [];
  };

  public deleteMessage = async (id: string, queue: QUEUES) => {
    const params = {
      QueueUrl: AWSQueue.queueMap[queue],
      ReceiptHandle: id,
    };

    await this.client.deleteMessage(params).promise();
  };
}

export default Queue;
