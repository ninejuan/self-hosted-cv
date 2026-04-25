import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';

import { CreateWritingDto } from './dto/create-writing.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateWritingDto } from './dto/update-writing.dto';
import { Writing } from './entities/writing.entity';
import { WritingService } from './writing.service';

@Controller('admin/writings')
export class WritingController {
    constructor(private readonly writingService: WritingService) {}

    @Get()
    findAll(): Promise<Writing[]> {
        return this.writingService.findAll();
    }

    @Post()
    create(@Body() dto: CreateWritingDto): Promise<Writing> {
        return this.writingService.create(dto);
    }

    @Put('reorder')
    reorder(@Body() dto: ReorderDto): Promise<Writing[]> {
        return this.writingService.reorder(dto);
    }

    @Put(':id')
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateWritingDto): Promise<Writing> {
        return this.writingService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ id: string }> {
        return this.writingService.delete(id);
    }
}
