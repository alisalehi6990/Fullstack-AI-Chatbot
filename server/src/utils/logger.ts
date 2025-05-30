import winston from 'winston';
import path from 'path';

const logDir = 'logs';
const logFile = path.join(logDir, 'error.log');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: logFile }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export const logError = (
  error: Error,
  context: {
    userId?: string;
    functionName: string;
    additionalInfo?: any;
  }
) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userId: context.userId,
    functionName: context.functionName,
    additionalInfo: context.additionalInfo
  });
};

export default logger; 