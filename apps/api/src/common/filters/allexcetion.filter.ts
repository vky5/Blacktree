import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch() // This will catch all exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let status = 500; // Default to 500 Internal Server Error
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      // If it's an instance of HttpException, get status and message
      status = exception.getStatus();
      message = exception.message || 'Internal Server Error';
    } else if (exception instanceof Error) {
      // For regular errors, use the message
      message = exception.message || 'Internal Server Error';
    }

    const resObj = {
      status: 'error',
      message,
    };

    // Log the exception (stack trace in development)
    // TODO close it in production
    this.logger.error(exception instanceof Error ? exception.stack : message);

    // If in development mode, add the stack trace for debugging
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      response.status(status).json({ ...resObj, error: exception.stack });
    } else {
      // In production or any other environment, omit the stack trace
      response.status(status).json(resObj);
    }
  }
}
