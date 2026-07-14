import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../packages/shared-kernel/exceptions/domain.exception';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred.';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resContent = exception.getResponse() as
        string | { message?: string | string[]; code?: string };

      if (typeof resContent === 'string') {
        message = resContent;
      } else {
        const msg = resContent.message;
        message = Array.isArray(msg) ? msg.join(', ') : msg || exception.message;
        code = resContent.code || 'HTTP_EXCEPTION';
      }
    } else if (exception instanceof DomainException) {
      statusCode = exception.statusCode;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(`Prisma Error: ${exception.code} - ${exception.message}`);

      switch (exception.code) {
        case 'P2002':
          statusCode = HttpStatus.CONFLICT;
          code = 'ENTITY_ALREADY_EXISTS';
          message = 'Existing Data';
          break;
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          code = 'ENTITY_NOT_FOUND';
          message = 'Not Found';
          break;
        case 'P2003':
          statusCode = HttpStatus.BAD_REQUEST;
          code = 'INVALID_DATA_REFERENCE';
          message = 'Invalid Data Reference';
          break;
        default:
          statusCode = HttpStatus.BAD_REQUEST;
          code = 'DATABASE_ERROR';
          message = 'Data Error';
      }
    } else if (exception instanceof Error) {
      this.logger.error(`[SystemError] ${exception.message}`, exception.stack);
      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
      } else {
        message = 'An unexpected error occurred.';
      }
    } else {
      this.logger.error(
        `Unhandled Exception: ${ctx.getRequest<Request>().method} ${ctx.getRequest<Request>().url}`,
        exception instanceof Error ? exception.stack : exception,
      );
      message = 'Internal Server Error';
    }

    response.status(statusCode).json({
      code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
