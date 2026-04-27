import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { CvTemplate } from './entities/cv-template.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(CvTemplate)
    private readonly templateModel: typeof CvTemplate,
  ) {}

  findPublic(): Promise<CvTemplate[]> {
    return this.templateModel.findAll({
      where: { isActive: true, visibility: 'public' },
      order: [
        ['sortOrder', 'ASC'],
        ['label', 'ASC'],
      ],
    });
  }

  findAll(): Promise<CvTemplate[]> {
    return this.templateModel.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['label', 'ASC'],
      ],
    });
  }

  async findPublicByKey(key: string): Promise<CvTemplate> {
    const template = await this.templateModel.findOne({
      where: { key, isActive: true, visibility: 'public' },
    });

    if (!template) {
      throw new NotFoundException('CV template not found');
    }

    return template;
  }
}
