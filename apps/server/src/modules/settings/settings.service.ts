import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AppSetting } from './entities/app-setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(AppSetting) private readonly settingModel: typeof AppSetting,
  ) {}

  findAll(): Promise<AppSetting[]> {
    return this.settingModel.findAll({ order: [['key', 'ASC']] });
  }

  async update(dto: UpdateSettingsDto): Promise<AppSetting[]> {
    await Promise.all(
      Object.entries(dto.settings).map(([key, value]) =>
        this.settingModel.upsert({ key, value }),
      ),
    );

    return this.findAll();
  }
}
