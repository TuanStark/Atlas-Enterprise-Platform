import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result } from '../../packages/shared-kernel/application/result/result';

@Injectable()
export class ResultTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result) => {
        if (result instanceof Result && !result.success) {
          throw new HttpException(
            {
              message: result.message,
              code: result.code,
              errors: result.errors,
            },
            result.statusCode,
          );
        }
        return result;
      }),
    );
  }
}
