import { DataTypes, QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }): Promise<void> {
    await context.addColumn('profiles', 'favicon_url', {
        type: DataTypes.STRING,
        allowNull: true,
    });
}

export async function down({ context }: { context: QueryInterface }): Promise<void> {
    await context.removeColumn('profiles', 'favicon_url');
}
