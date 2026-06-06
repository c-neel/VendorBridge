/**
 * Structured Logger for VendorBridge API.
 * Provides time-stamped, level-based logging with structured JSON output.
 * Replaces raw console.log statements for professional observability.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_COLORS: Record<LogLevel, string> = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
};

const RESET = '\x1b[0m';

class Logger {
  private serviceName: string;

  constructor(serviceName = 'VendorBridge-API') {
    this.serviceName = serviceName;
  }

  private format(level: LogLevel, message: string, meta?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level];
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${color}[${timestamp}] [${level}] [${this.serviceName}]${RESET} ${message}${metaStr}`;
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'production') return;
    console.debug(this.format('DEBUG', message, meta));
  }

  info(message: string, meta?: Record<string, any>): void {
    console.info(this.format('INFO', message, meta));
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(this.format('WARN', message, meta));
  }

  error(message: string, error?: Error | any, meta?: Record<string, any>): void {
    const errorMeta: Record<string, any> = { ...meta };
    if (error instanceof Error) {
      errorMeta.errorName = error.name;
      errorMeta.errorMessage = error.message;
      if (process.env.NODE_ENV !== 'production') {
        errorMeta.stack = error.stack;
      }
    }
    console.error(this.format('ERROR', message, errorMeta));
  }

  /**
   * Express request logger middleware.
   * Logs method, URL, status code, and response time.
   */
  requestLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      const originalEnd = res.end;

      res.end = (...args: any[]) => {
        const duration = Date.now() - start;
        const level: LogLevel = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
        this[level.toLowerCase() as 'info' | 'warn' | 'error'](`${req.method} ${req.originalUrl}`, {
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
        } as any);
        originalEnd.apply(res, args);
      };

      next();
    };
  }
}

export const logger = new Logger();
