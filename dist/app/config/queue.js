"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultQueueOptions = exports.redisConnection = void 0;
const index_1 = __importDefault(require("./index"));
exports.redisConnection = {
    host: index_1.default.REDIS_HOST || 'localhost',
    port: parseInt(index_1.default.REDIS_PORT) || 6379
};
exports.defaultQueueOptions = {
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
