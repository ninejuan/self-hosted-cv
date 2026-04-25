import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Profile } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
    imports: [SequelizeModule.forFeature([Profile])],
    controllers: [ProfileController],
    providers: [ProfileService],
    exports: [ProfileService],
})
export class ProfileModule {}
