import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';

import { CreateSpeakingDto } from './dto/create-speaking.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateSpeakingDto } from './dto/update-speaking.dto';
import { Speaking } from './entities/speaking.entity';
import { SpeakingService } from './speaking.service';

@Controller('admin/speakings')
export class SpeakingController {
    constructor(private readonly speakingService: SpeakingService) {}

    @Get()
    findAll(): Promise<Speaking[]> {
        return this.speakingService.findAll();
    }

    @Post()
    create(@Body() dto: CreateSpeakingDto): Promise<Speaking> {
        return this.speakingService.create(dto);
    }

    @Put('reorder')
    reorder(@Body() dto: ReorderDto): Promise<Speaking[]> {
        return this.speakingService.reorder(dto);
    }

    @Put(':id')
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateSpeakingDto): Promise<Speaking> {
        return this.speakingService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ id: string }> {
        return this.speakingService.delete(id);
    }
}
