import { Body, Controller, Get, Put } from '@nestjs/common';

import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AppSetting } from './entities/app-setting.entity';
import { SettingsService } from './settings.service';

@Controller('admin/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get()
    findAll(): Promise<AppSetting[]> {
        return this.settingsService.findAll();
    }

    @Put()
    update(@Body() dto: UpdateSettingsDto): Promise<AppSetting[]> {
        return this.settingsService.update(dto);
    }
}
