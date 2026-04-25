import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LinkedinImportDto } from './dto/import-linkedin.dto';
import { LinkedinService } from './linkedin.service';

@Controller('admin/linkedin')
export class LinkedinController {
    constructor(private readonly linkedinService: LinkedinService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
    upload(@UploadedFile() file: Express.Multer.File): ReturnType<LinkedinService['preview']> {
        return this.linkedinService.preview(file);
    }

    @Post('import')
    import(@Body() dto: LinkedinImportDto): ReturnType<LinkedinService['import']> {
        return this.linkedinService.import(dto);
    }
}
