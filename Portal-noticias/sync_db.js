require('dotenv').config();
const { sequelize } = require('./config/database');
const { User, Category, News, Payment } = require('./models');

const syncDatabase = async () => {
    try {
        console.log('🔄 Authenticating...');
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        console.log('🔄 Syncing Payment model (alter: true)...');
        await Payment.sync({ alter: true });
        console.log('✅ Payment table synced successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing database:', error);
        process.exit(1);
    }
};

syncDatabase();
