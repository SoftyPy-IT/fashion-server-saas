import { ConnectionOptions, DefaultJobOptions } from 'bullmq';
import config from './index';
export const redisConnection: ConnectionOptions = {
  host: config.REDIS_HOST || 'localhost',
  port: parseInt(config.REDIS_PORT as string) || 6379
};

export const defaultQueueOptions: DefaultJobOptions = {
  removeOnComplete: {
    count: 20,
    age: 60 * 60 // 1 hour
  },
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  },
  removeOnFail: false
};
