/**
 * Centralized logging service
 * Provides structured logging for errors and events
 */

export interface LogContext {
  phoneNumber?: string
  postId?: string
  userId?: string
  error?: Error
  [key: string]: any
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log a message with context
 */
export function log(
  level: LogLevel,
  message: string,
  context?: LogContext
): void {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  }

  // Format error if present
  if (context?.error && context.error instanceof Error) {
    logEntry.error = {
      message: context.error.message,
      stack: context.error.stack,
      name: context.error.name,
    }
  }

  // Log to console with appropriate method
  const logMessage = JSON.stringify(logEntry, null, 2)

  switch (level) {
    case LogLevel.DEBUG:
      if (process.env.NODE_ENV === 'development') {
        console.debug(logMessage)
      }
      break
    case LogLevel.INFO:
      console.log(logMessage)
      break
    case LogLevel.WARN:
      console.warn(logMessage)
      break
    case LogLevel.ERROR:
      console.error(logMessage)
      break
  }

  // In production, you might want to send to external logging service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Log debug message
 */
export function logDebug(message: string, context?: LogContext): void {
  log(LogLevel.DEBUG, message, context)
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: LogContext): void {
  log(LogLevel.INFO, message, context)
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  log(LogLevel.WARN, message, context)
}

/**
 * Log error message
 */
export function logError(message: string, context?: LogContext): void {
  log(LogLevel.ERROR, message, context)
}

/**
 * Log error with exception
 */
export function logException(error: Error, message?: string, context?: LogContext): void {
  logError(message || error.message, {
    ...context,
    error,
  })
}

