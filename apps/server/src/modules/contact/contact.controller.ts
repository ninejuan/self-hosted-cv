import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';

import { CreateContactDto } from './dto/create-contact.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { SocialLink } from './entities/social-link.entity';
import { ContactService } from './contact.service';

@Controller('admin/contacts')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Get()
    findAll(): Promise<SocialLink[]> {
        return this.contactService.findAll();
    }

    @Post()
    create(@Body() dto: CreateContactDto): Promise<SocialLink> {
        return this.contactService.create(dto);
    }

    @Put('reorder')
    reorder(@Body() dto: ReorderDto): Promise<SocialLink[]> {
        return this.contactService.reorder(dto);
    }

    @Put(':id')
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateContactDto): Promise<SocialLink> {
        return this.contactService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ id: string }> {
        return this.contactService.delete(id);
    }
}
