require('dotenv').config();
const { sequelize } = require('./config/database');
const { Source } = require('./models');

const syncDatabase = async () => {
    try {
        console.log('🔄 Authenticating...');
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        console.log('🔄 Syncing Source model (alter: true)...');
        await Source.sync({ alter: true });
        console.log('✅ Source table synced successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing database:', error);
        process.exit(1);
    }
};

syncDatabase();
