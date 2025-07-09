"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const fs_1 = __importDefault(require("fs"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const node_cron_1 = __importDefault(require("node-cron"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = __importDefault(require("./app/config"));
const auth_1 = __importDefault(require("./app/middlewares/auth"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const requestLoggerMiddleware_1 = require("./app/middlewares/requestLoggerMiddleware");
const routes_1 = __importDefault(require("./app/routes"));
const backupService_1 = require("./app/utils/backupService");
const logger_1 = require("./app/utils/logger");
const logReader_1 = require("./app/utils/logReader");
const swagger_1 = require("./app/utils/swagger");
const app = (0, express_1.default)();
// Set security HTTP headers
app.use((0, helmet_1.default)());
// Logging middleware in development environment
if (config_1.default.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Rate limiting middleware
app.use((0, express_rate_limit_1.default)({
    max: 2000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests sent by this IP, please try again in an hour!'
}));
// Parse incoming requests
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.set('view engine', 'ejs');
// Serve static files
app.use(express_1.default.static(process.cwd() + '/public'));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        const regex = /^https?:\/\/([a-zA-Z0-9-]+\.)*fashion\.com\.bd$/;
        if (regex.test(origin) ||
            origin === 'http://localhost:3000' ||
            origin === 'http://localhost:5173') {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));
// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});
app.get('/api/v1/logs', (0, auth_1.default)('admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, logReader_1.getAllLogsService)(req);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to read log files' });
    }
}));
app.post('/api/v1/backup', (0, auth_1.default)('admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, backupService_1.backupMongoDB)();
        res.json({ status: 'success', message: 'Backup completed successfully' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Backup failed', error: error.message });
    }
}));
app.post('/api/v1/restore', (0, auth_1.default)('admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, backupService_1.restoreMongoDB)();
        res.json({ status: 'success', message: 'Restore completed successfully' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Restore failed', error: error.message });
    }
}));
app.get('/api/v1/backup-logs', (0, auth_1.default)('admin'), (req, res) => {
    const logPath = path_1.default.join(process.cwd(), 'public', 'backup_logs.json');
    if (fs_1.default.existsSync(logPath)) {
        const logs = JSON.parse(fs_1.default.readFileSync(logPath, 'utf8'));
        // Sort logs by backupEndTime in descending order
        logs.sort((a, b) => new Date(b.backupEndTime).getTime() - new Date(a.backupEndTime).getTime());
        res.json(logs);
    }
    else {
        res.status(404).json({ message: 'No logs found' });
    }
});
// Scheduled backup every day at midnight
node_cron_1.default.schedule('0 0 * * *', () => {
    console.log('Running daily scheduled backup...');
    (0, backupService_1.backupMongoDB)()
        .then(() => console.log('Backup completed successfully'))
        .catch((error) => console.error('Backup failed:', error));
});
// Swagger documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs, {
    customCss: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.6/swagger-ui.js'
}));
// API routes
app.use('/api/v1', routes_1.default);
// Middlewares
app.use(globalErrorHandler_1.default);
app.use(logger_1.morganMiddleware);
app.use(requestLoggerMiddleware_1.requestLoggerMiddleware);
app.use(notFound_1.default);
// System logs
const logDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
    logger_1.systemLogs.info(`Created logs directory at ${logDir}`);
}
exports.default = app;
