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
const chalk_1 = __importDefault(require("chalk"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const DB_1 = __importDefault(require("./app/DB"));
const logger_1 = require("./app/utils/logger");
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(config_1.default.DATABASE_URL);
            // seeding the database with initial data one by one in sequence order
            for (const seed of DB_1.default) {
                yield seed();
            }
            server = app_1.default.listen(config_1.default.PORT, () => {
                console.log(`${chalk_1.default.green.bold('👍')} server is running in ${chalk_1.default.yellow.bold(process.env.NODE_ENV)} mode on port ${chalk_1.default.blue.bold(config_1.default.PORT)}
      `);
                logger_1.systemLogs.info(`Server is running in ${process.env.NODE_ENV} mode and ${process.env.PORT}`);
            });
        }
        catch (error) {
            console.log(chalk_1.default.red.bold('😈 Error in starting server', error));
        }
    });
}
main();
process.on('unhandledRejection', (error) => {
    const errorMessage = config_1.default.NODE_ENV === 'development'
        ? error.message + ' ' + '😈 unhandledRejection is detected, shutting down ...'
        : '😈 unhandledRejection is detected, shutting down ...';
    console.log(errorMessage);
    logger_1.systemLogs.error(`unhandledRejection is detected, shutting down ... ${error}`);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    const errorMessage = config_1.default.NODE_ENV === 'development'
        ? error.message + ' ' + '😈 uncaughtException is detected, shutting down ...'
        : '😈 uncaughtException is detected, shutting down ...';
    console.log(errorMessage);
    logger_1.systemLogs.error(`uncaughtException is detected, shutting down ... ${error}`);
    process.exit(1);
});
exports.default = app_1.default;
