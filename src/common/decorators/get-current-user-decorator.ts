import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUser: (property?: string) => ParameterDecorator =
  createParamDecorator(
    (property: string | undefined, context: ExecutionContext) => {
      const req: any = context.switchToHttp().getRequest();
      if (req.user) {
        return property ? req.user[property] : req.user;
      }
    },
  );
