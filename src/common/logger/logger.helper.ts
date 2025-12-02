import { Logger, LoggerService } from '@nestjs/common';

export class AppLogger {
  // Singleton instance of Nest Logger for the whole app
  private static readonly logger: Logger = new Logger('App');

  // Expose underlying LoggerService in case you want to plug it into Nest (app.useLogger)
  static readonly instance: LoggerService = AppLogger.logger;

  static log(message: string, context?: string, meta?: unknown) {
    AppLogger.logger.log(message, context, meta);
  }

  static error(
    message: string,
    error?: unknown,
    context?: string,
    meta?: unknown,
  ) {
    const stack = error instanceof Error ? error.stack : undefined;
    AppLogger.logger.error(message, stack, context, meta);
  }

  static warn(message: string, context?: string, meta?: unknown) {
    AppLogger.logger.warn(AppLogger.formatMessage(message, meta), context);
  }

  static debug(message: string, context?: string, meta?: unknown) {
    AppLogger.logger.debug(AppLogger.formatMessage(message, meta), context);
  }

  static verbose(message: string, context?: string, meta?: unknown) {
    AppLogger.logger.verbose(AppLogger.formatMessage(message, meta), context);
  }

  private static formatMessage(message: string, meta?: unknown) {
    if (!meta) return message;
    try {
      const serialized =
        typeof meta === 'string' ? meta : JSON.stringify(meta, null, 2);
      return `${message} | meta: ${serialized}`;
    } catch {
      return message;
    }
  }
}
