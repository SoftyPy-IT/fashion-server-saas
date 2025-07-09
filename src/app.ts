import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import cron from 'node-cron';
import path from 'path';

import swaggerUi from 'swagger-ui-express';
import config from './app/config';
import auth from './app/middlewares/auth';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import { requestLoggerMiddleware } from './app/middlewares/requestLoggerMiddleware';
import router from './app/routes';
import { backupMongoDB, restoreMongoDB } from './app/utils/backupService';
import { morganMiddleware, systemLogs } from './app/utils/logger';
import { getAllLogsService } from './app/utils/logReader';
import { specs } from './app/utils/swagger';
import Product from './app/modules/product/product.model';

const app: Application = express();

// Set security HTTP headers
app.use(helmet());

// Logging middleware in development environment
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting middleware
app.use(
  rateLimit({
    max: 2000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests sent by this IP, please try again in an hour!'
  })
);

// Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');
// Serve static files
app.use(express.static(process.cwd() + '/public'));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const regex = /^https?:\/\/([a-zA-Z0-9-]+\.)*fashion\.com\.bd$/;

      if (
        regex.test(origin) ||
        origin === 'http://localhost:3000' ||
        origin === 'http://localhost:5173'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  })
);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'UP' });
});

app.get('/api/v1/logs', auth('admin'), async (req: Request, res: Response) => {
  try {
    const result = await getAllLogsService(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read log files' });
  }
});

app.post('/api/v1/backup', auth('admin'), async (req: Request, res: Response) => {
  try {
    await backupMongoDB();
    res.json({ status: 'success', message: 'Backup completed successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Backup failed', error: error.message });
  }
});

app.post('/api/v1/restore', auth('admin'), async (req: Request, res: Response) => {
  try {
    await restoreMongoDB();
    res.json({ status: 'success', message: 'Restore completed successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Restore failed', error: error.message });
  }
});

app.get('/api/v1/backup-logs', auth('admin'), (req: Request, res: Response) => {
  const logPath = path.join(process.cwd(), 'public', 'backup_logs.json');

  if (fs.existsSync(logPath)) {
    const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));

    // Sort logs by backupEndTime in descending order
    logs.sort(
      (a: any, b: any) => new Date(b.backupEndTime).getTime() - new Date(a.backupEndTime).getTime()
    );

    res.json(logs);
  } else {
    res.status(404).json({ message: 'No logs found' });
  }
});

// Scheduled backup every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running daily scheduled backup...');
  backupMongoDB()
    .then(() => console.log('Backup completed successfully'))
    .catch((error) => console.error('Backup failed:', error));
});

// Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.6/swagger-ui.js'
  })
);

// API routes
app.use('/api/v1', router);

// Middlewares
app.use(globalErrorHandler);
app.use(morganMiddleware);
app.use(requestLoggerMiddleware);
app.use(notFound);

// System logs
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  systemLogs.info(`Created logs directory at ${logDir}`);
}

export default app;
