import { Body, Controller, Get, Put } from '@nestjs/common';

import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { Section } from './entities/section.entity';
import { SectionService } from './section.service';

@Controller('admin/sections')
export class SectionController {
    constructor(private readonly sectionService: SectionService) {}

    @Get()
    getSections(): Promise<Section[]> {
        return this.sectionService.getSections();
    }

    @Put('reorder')
    reorder(@Body() dto: ReorderSectionsDto): Promise<Section[]> {
        return this.sectionService.reorder(dto);
    }
}
