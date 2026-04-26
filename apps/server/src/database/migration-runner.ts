import path from 'node:path';

import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';

import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class MigrationRunner {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly logger: LoggerService,
  ) {}

  async runPendingMigrations(): Promise<void> {
    const migrator = new Umzug({
      migrations: {
        glob: path.join(__dirname, 'migrations', '*.{js,ts}'),
      },
      context: this.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: this.sequelize }),
      logger: {
        info: (message) =>
          this.logger.log(JSON.stringify(message), MigrationRunner.name),
        warn: (message) =>
          this.logger.warn(JSON.stringify(message), MigrationRunner.name),
        error: (message) =>
          this.logger.error(
            JSON.stringify(message),
            undefined,
            MigrationRunner.name,
          ),
        debug: (message) =>
          this.logger.debug(JSON.stringify(message), MigrationRunner.name),
      },
    });

    const pending = await migrator.pending();
    this.logger.log(
      `Pending migrations: ${pending.length}`,
      MigrationRunner.name,
    );

    const executed = await migrator.up();
    this.logger.log(
      `Executed migrations: ${executed.map((migration) => migration.name).join(', ') || 'none'}`,
      MigrationRunner.name,
    );
  }
}
