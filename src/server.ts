import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

import config from '@/config';
import limiter from '@/lib/express_rate_limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger } from '@/lib/winston';

import type { CorsOptions } from 'cors';

/**
 * Router
 */
import v1Routes from '@/routes/v1';

/**
 * Express app initial
 */
const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      // Reject requests from non-whitelisted origins
      callback(
        new Error(`CORS errros: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn(`CORS errros: ${origin} is not allowed by CORS`);
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  compression({
    threshold: 1024, // Only compress responses larger than 1KB
  }),
);
app.use(helmet());
app.use(limiter);

/**
 * Immediatly Invoked Async Function Expression (IIFE) to start the server.
 *
 * - Tries to connect to the database before initializing the server.
 * - Defines the API route ('/api/v1').
 * - Starts the server on the specified PORT and logs the running URL.
 * - If an error occurs during startup, it is logged, and the process exits with status 1.
 */
(async () => {
  try {
    await connectToDatabase();

    app.use('/api/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server running: http://localhost:${config.PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start the server', err);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

/**
 * Handles server shutdown gracefully by disconnecting from the database.
 *
 * - Attempts to disconnect from the database before shutting down the server.
 * - Logs a success message if the disconnection is successful.
 * - If an errror occurs during disconnection, it is logged to the console.
 * - Exits the process with status code `0` (indicating a successful shutdown).
 */
const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Server SHUTDOWN');
    process.exit(0);
  } catch (err) {
    logger.error('Error during server shutdown', err);
  }
};

/**
 * Listens fro termination signals (`SIGTERM` and `SIGINT`).
 *
 * - `SIGTERM` is typically sent when stopping a process (e.g., `kill` command or container shutdown).
 * - `SIGINT` is triggered when the user interrupts the process (e.g., processing `Ctrl + C`).
 * - When either signal is received, `handleServerShutdown` is executed to ensure proper cleanup.
 */
process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
