import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { LoggerService } from '@/logger/logger.service';

type RequestWithId = Request & {
  requestId?: string;
  startedAtNs?: bigint;
};

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const existingRequestId = req.header('x-request-id');
    const requestId =
      existingRequestId && existingRequestId.trim().length > 0
        ? existingRequestId
        : uuidv4();

    req.requestId = requestId;
    req.startedAtNs = process.hrtime.bigint();
    res.setHeader('x-request-id', requestId);

    this.logger.runWithContext(
      {
        requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userAgent: req.header('user-agent'),
      },
      next,
    );
  }
}
