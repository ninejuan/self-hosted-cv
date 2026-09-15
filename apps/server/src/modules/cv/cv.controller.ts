import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';

import { Public } from '@/common/decorators/public.decorator';

import { CvService } from './cv.service';

@Public()
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCv(@Res() res: Response): Promise<void> {
    const cv = await this.cvService.getCv();

    if (!cv) {
      res.status(HttpStatus.NOT_FOUND).json({ profile: null, sections: [] });
      return;
    }

    res.status(HttpStatus.OK).json(cv);
  }
}
