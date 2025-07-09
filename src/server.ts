import chalk from 'chalk';
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import seeders from './app/DB';
import { systemLogs } from './app/utils/logger';
let server: Server;

async function main() {
  try {
    await mongoose.connect(config.DATABASE_URL as string);

    // seeding the database with initial data one by one in sequence order
    for (const seed of seeders) {
      await seed();
    }

    server = app.listen(config.PORT, () => {
      console.log(`${chalk.green.bold('👍')} server is running in ${chalk.yellow.bold(
        process.env.NODE_ENV
      )} mode on port ${chalk.blue.bold(config.PORT)}
      `);
      systemLogs.info(`Server is running in ${process.env.NODE_ENV} mode and ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(chalk.red.bold('😈 Error in starting server', error));
  }
}

main();

process.on('unhandledRejection', (error: any) => {
  const errorMessage =
    config.NODE_ENV === 'development'
      ? error.message + ' ' + '😈 unhandledRejection is detected, shutting down ...'
      : '😈 unhandledRejection is detected, shutting down ...';

  console.log(errorMessage);

  systemLogs.error(`unhandledRejection is detected, shutting down ... ${error}`);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (error: any) => {
  const errorMessage =
    config.NODE_ENV === 'development'
      ? error.message + ' ' + '😈 uncaughtException is detected, shutting down ...'
      : '😈 uncaughtException is detected, shutting down ...';

  console.log(errorMessage);

  systemLogs.error(`uncaughtException is detected, shutting down ... ${error}`);
  process.exit(1);
});

export default app;
