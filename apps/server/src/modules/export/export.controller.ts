import {
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ExportService } from './export.service';

@Controller('admin/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async exportSite(@Req() req: Request, @Res() res: Response): Promise<void> {
    const canonicalUrl = this.resolveCanonicalUrl(req);
    const zip = await this.exportService.buildZip(canonicalUrl);

    if (!zip) {
      res.status(404).json({ message: 'No profile to export' });
      return;
    }

    const filename = `cv-static-site-${new Date()
      .toISOString()
      .slice(0, 10)}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zip.length);
    res.end(zip);
  }

  private resolveCanonicalUrl(req: Request): string | undefined {
    const configured = process.env.APP_URL;
    if (configured) return configured.replace(/\/$/, '');

    if (process.env.NODE_ENV === 'production') {
      throw new InternalServerErrorException(
        'APP_URL must be configured for production exports',
      );
    }

    const host = req.get('host');
    if (!host) return undefined;

    const protocol = req.protocol ?? 'https';
    return `${protocol}://${host}`;
  }
}
