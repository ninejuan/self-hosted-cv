import { Module } from '@nestjs/common';

import { UpdateCheckerController } from './update-checker.controller';
import { UpdateCheckerService } from './update-checker.service';

@Module({ controllers: [UpdateCheckerController], providers: [UpdateCheckerService] })
export class UpdateCheckerModule {}
