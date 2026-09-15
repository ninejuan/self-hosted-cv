import { Controller, Get, Param } from '@nestjs/common';

import { Public } from '@/common/decorators/public.decorator';

import { CvTemplate } from './entities/cv-template.entity';
import { TemplateService } from './template.service';

@Public()
@Controller('templates')
export class PublicTemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  findPublic(): Promise<CvTemplate[]> {
    return this.templateService.findPublic();
  }

  @Get(':key')
  findPublicByKey(@Param('key') key: string): Promise<CvTemplate> {
    return this.templateService.findPublicByKey(key);
  }
}

@Controller('admin/templates')
export class AdminTemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  findAll(): Promise<CvTemplate[]> {
    return this.templateService.findAll();
  }
}
