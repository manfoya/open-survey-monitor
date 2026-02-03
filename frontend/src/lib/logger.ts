/**
 * Utility for environment-aware logging.
 * Logs are only displayed in development mode (NODE_ENV === 'development').
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Errors are often important even in production,
    // but we can silence them if requested or send them to a service.
    if (isDev) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};
