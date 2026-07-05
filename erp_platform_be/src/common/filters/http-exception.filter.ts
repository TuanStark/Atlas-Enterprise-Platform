import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../packages/shared-kernel/exceptions/domain.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred.';
    let errors: unknown[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resContent = exception.getResponse() as
        string | { message?: string | string[]; code?: string; errors?: unknown[] };

      if (typeof resContent === 'string') {
        message = resContent;
      } else {
        const msg = resContent.message;
        message = Array.isArray(msg) ? msg.join(', ') : msg || exception.message;
        code = resContent.code || 'HTTP_EXCEPTION';
        if (resContent.errors) {
          errors = resContent.errors;
        }
      }
    } else if (exception instanceof DomainException) {
      statusCode = HttpStatus.BAD_REQUEST;
      code = exception.name.toUpperCase();
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      code,
      message,
      data: null,
      errors: errors.length > 0 ? errors : [{ message }],
    });
  }
}
