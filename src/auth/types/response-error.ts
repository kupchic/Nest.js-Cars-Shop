import { HttpStatus } from '@nestjs/common';

export type ResponseError = {
  statusCode: HttpStatus;
  message: string;
  path: string;
  timestamp?: string;
};
