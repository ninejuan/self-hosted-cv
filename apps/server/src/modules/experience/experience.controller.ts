import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';

import { CreateExperienceDto } from './dto/create-experience.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { WorkExperience } from './entities/work-experience.entity';
import { ExperienceService } from './experience.service';

@Controller('admin/experiences')
export class ExperienceController {
    constructor(private readonly experienceService: ExperienceService) {}

    @Get()
    findAll(): Promise<WorkExperience[]> {
        return this.experienceService.findAll();
    }

    @Post()
    create(@Body() dto: CreateExperienceDto): Promise<WorkExperience> {
        return this.experienceService.create(dto);
    }

    @Put('reorder')
    reorder(@Body() dto: ReorderDto): Promise<WorkExperience[]> {
        return this.experienceService.reorder(dto);
    }

    @Put(':id')
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateExperienceDto): Promise<WorkExperience> {
        return this.experienceService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ id: string }> {
        return this.experienceService.delete(id);
    }
}
