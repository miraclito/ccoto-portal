const { sequelize } = require('./config/database');

const migrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la BD');

        const queryInterface = sequelize.getQueryInterface();

        // Verificar si las columnas existen
        const tableInfo = await queryInterface.describeTable('users');

        if (!tableInfo.plan) {
            console.log('Adding plan column...');
            await queryInterface.addColumn('users', 'plan', {
                type: 'ENUM("free", "premium")',
                defaultValue: 'free'
            });
        }

        if (!tableInfo.subscriptionExpiresAt) {
            console.log('Adding subscriptionExpiresAt column...');
            await queryInterface.addColumn('users', 'subscriptionExpiresAt', {
                type: 'DATETIME',
                allowNull: true
            });
        }

        console.log('✅ Migración completada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en migración:', error);
        process.exit(1);
    }
};

migrate();
