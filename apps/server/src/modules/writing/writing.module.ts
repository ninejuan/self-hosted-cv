import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Writing } from './entities/writing.entity';
import { WritingController } from './writing.controller';
import { WritingService } from './writing.service';

@Module({
  imports: [SequelizeModule.forFeature([Writing])],
  controllers: [WritingController],
  providers: [WritingService],
  exports: [WritingService],
})
export class WritingModule {}
