import { QueryInterface } from 'sequelize';

const AUDIT_ACTION_TYPE = 'enum_audit_logs_action';

export async function up({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.sequelize.query(
    `ALTER TYPE ${AUDIT_ACTION_TYPE} ADD VALUE IF NOT EXISTS '2fa_disable';`,
  );
}

export async function down({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.sequelize.query(`
    DELETE FROM audit_logs WHERE action::text = '2fa_disable';
    ALTER TYPE ${AUDIT_ACTION_TYPE} RENAME TO ${AUDIT_ACTION_TYPE}_old;
    CREATE TYPE ${AUDIT_ACTION_TYPE} AS ENUM (
      'create',
      'update',
      'delete',
      'login',
      'logout',
      'login_failed',
      '2fa_setup',
      '2fa_verify'
    );
    ALTER TABLE audit_logs
      ALTER COLUMN action TYPE ${AUDIT_ACTION_TYPE}
      USING action::text::${AUDIT_ACTION_TYPE};
    DROP TYPE ${AUDIT_ACTION_TYPE}_old;
  `);
}
