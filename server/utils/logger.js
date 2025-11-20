/**
 * Production-safe logger utility
 * Logs to console in development, silent or structured in production
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = {
  // Regular logs - only in development
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  // Info logs - always show but structured in production
  info: (...args) => {
    if (isDevelopment) {
      console.log('ℹ️', ...args);
    } else {
      console.log(JSON.stringify({ level: 'info', message: args.join(' '), timestamp: new Date().toISOString() }));
    }
  },

  // Errors - always show
  error: (...args) => {
    console.error('❌', ...args);
  },

  // Warnings - always show
  warn: (...args) => {
    console.warn('⚠️', ...args);
  },

  // Success messages - only in development
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },

  // Debug logs - only in development with DEBUG=true
  debug: (...args) => {
    if (isDevelopment && process.env.DEBUG === 'true') {
      console.log('🐛', ...args);
    }
  },
};

export default logger;
