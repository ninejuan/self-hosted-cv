import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';

import { CreateProjectDto } from './dto/create-project.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SideProject } from './entities/side-project.entity';
import { ProjectService } from './project.service';

@Controller('admin/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(): Promise<SideProject[]> {
    return this.projectService.findAll();
  }

  @Post()
  create(@Body() dto: CreateProjectDto): Promise<SideProject> {
    return this.projectService.create(dto);
  }

  @Put('reorder')
  reorder(@Body() dto: ReorderDto): Promise<SideProject[]> {
    return this.projectService.reorder(dto);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<SideProject> {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ id: string }> {
    return this.projectService.delete(id);
  }
}
