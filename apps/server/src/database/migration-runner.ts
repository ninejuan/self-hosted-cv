import path from 'node:path';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';

@Injectable()
export class MigrationRunner {
  private readonly logger = new Logger(MigrationRunner.name);

  constructor(
    @Inject(getConnectionToken()) private readonly sequelize: Sequelize,
  ) {}

  async runPendingMigrations(): Promise<void> {
    const migrator = new Umzug({
      migrations: {
        glob: [
          path.join(__dirname, 'migrations', '*.{js,ts}'),
          { ignore: ['**/*.d.ts'] },
        ],
      },
      context: this.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: this.sequelize }),
      logger: {
        info: (message) => this.logger.log(JSON.stringify(message)),
        warn: (message) => this.logger.warn(JSON.stringify(message)),
        error: (message) => this.logger.error(JSON.stringify(message)),
        debug: (message) => this.logger.debug(JSON.stringify(message)),
      },
    });

    const pending = await migrator.pending();
    this.logger.log(`Pending migrations: ${pending.length}`);

    const executed = await migrator.up();
    this.logger.log(
      `Executed migrations: ${executed.map((migration) => migration.name).join(', ') || 'none'}`,
    );
  }
}
