import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { MediaStatus } from '@/database/enums';

import { ConfirmMediaDto } from './dto/confirm-media.dto';
import { PresignMediaDto } from './dto/presign-media.dto';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';

@Controller('admin/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign')
  presign(
    @Body() dto: PresignMediaDto,
  ): Promise<{ upload_url: string; key: string; file_url: string }> {
    return this.mediaService.presign(dto);
  }

  @Post('confirm')
  confirm(@Body() dto: ConfirmMediaDto): Promise<Media> {
    return this.mediaService.confirm(dto);
  }

  @Delete(':id')
  delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ id: string; status: MediaStatus.Deleted }> {
    return this.mediaService.delete(id);
  }
}
