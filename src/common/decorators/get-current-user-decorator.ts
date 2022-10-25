import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUser: (data?: string) => ParameterDecorator =
  createParamDecorator(
    (data: string | undefined, context: ExecutionContext) => {
      const req: any = context.switchToHttp().getRequest();
      if (req.user) {
        return data ? req.user[data] : req.user;
      }
    },
  );
