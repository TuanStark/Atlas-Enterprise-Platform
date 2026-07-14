import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from '@shared-kernel/application/request-context';

export const CurrentContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestContext => {
    const request = ctx.switchToHttp().getRequest();

    return request.context;
  },
);
