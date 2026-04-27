import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';

import { AppSetting } from '@/modules/settings/entities/app-setting.entity';

const ADMIN_USERNAME_KEY = 'admin_username';
const ADMIN_PASSWORD_HASH_KEY = 'admin_password_hash';
const BCRYPT_ROUNDS = 10;

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(AppSetting)
    private readonly settingModel: typeof AppSetting,
  ) {}

  async onModuleInit(): Promise<void> {
    const envUsername = this.configService.getOrThrow<string>('ADMIN_USERNAME');
    const envPassword = this.configService.getOrThrow<string>('ADMIN_PASSWORD');

    const existingUsername = await this.settingModel.findOne({
      where: { key: ADMIN_USERNAME_KEY },
    });
    const existingHash = await this.settingModel.findOne({
      where: { key: ADMIN_PASSWORD_HASH_KEY },
    });

    const storedUsername = existingUsername?.value?.username as
      | string
      | undefined;
    const storedHash = existingHash?.value?.hash as string | undefined;

    const usernameChanged = storedUsername !== envUsername;
    const passwordChanged =
      !storedHash || !(await bcrypt.compare(envPassword, storedHash));

    if (usernameChanged) {
      await this.settingModel.upsert({
        key: ADMIN_USERNAME_KEY,
        value: { username: envUsername },
      });
      this.logger.log(`Admin username synced from env`);
    }

    if (passwordChanged) {
      const hash = await bcrypt.hash(envPassword, BCRYPT_ROUNDS);
      await this.settingModel.upsert({
        key: ADMIN_PASSWORD_HASH_KEY,
        value: { hash },
      });
      this.logger.log(`Admin password hash synced from env`);
    }

    if (!usernameChanged && !passwordChanged) {
      this.logger.log(`Admin credentials up to date`);
    }
  }
}
