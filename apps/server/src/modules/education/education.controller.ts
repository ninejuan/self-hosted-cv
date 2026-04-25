import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';

import { CreateEducationDto } from './dto/create-education.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { Education } from './entities/education.entity';
import { EducationService } from './education.service';

@Controller('admin/educations')
export class EducationController {
    constructor(private readonly educationService: EducationService) {}

    @Get()
    findAll(): Promise<Education[]> {
        return this.educationService.findAll();
    }

    @Post()
    create(@Body() dto: CreateEducationDto): Promise<Education> {
        return this.educationService.create(dto);
    }

    @Put('reorder')
    reorder(@Body() dto: ReorderDto): Promise<Education[]> {
        return this.educationService.reorder(dto);
    }

    @Put(':id')
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateEducationDto): Promise<Education> {
        return this.educationService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ id: string }> {
        return this.educationService.delete(id);
    }
}
