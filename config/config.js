require('dotenv').config()

module.exports = {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'fotaza',
    host: process.env.DB_HOST || 'localhost',
    dbport: process.env.DB_PORT || 3307,
    
    //configuracion de las seeds
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeSeeds',

    //configurar las migraciones
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'SequelizeMigrations',

    dialect: process.env.DB_DIALECT || 'mariadb'
}
