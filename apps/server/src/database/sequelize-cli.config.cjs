const sslEnabled = process.env.DB_SSL === 'true';

module.exports = {
    development: {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        schema: process.env.DB_SCHEMA,
        dialectOptions: sslEnabled
            ? {
                  ssl: {
                      require: true,
                      rejectUnauthorized: false,
                  },
              }
            : undefined,
    },
    test: {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        schema: process.env.DB_SCHEMA,
    },
    production: {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        schema: process.env.DB_SCHEMA,
        dialectOptions: sslEnabled
            ? {
                  ssl: {
                      require: true,
                      rejectUnauthorized: false,
                  },
              }
            : undefined,
    },
};
