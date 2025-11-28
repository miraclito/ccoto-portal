const { News, Category } = require('./models');
const { sequelize } = require('./config/database');
const { Op } = require('sequelize');

(async () => {
    try {
        console.log('🔄 Testing News by Category...');
        const newsByCategory = await News.findAll({
            attributes: [
                [sequelize.col('Category.name'), 'categoryName'],
                [sequelize.fn('COUNT', sequelize.col('News.id')), 'count']
            ],
            include: [{
                model: Category,
                attributes: []
            }],
            group: ['Category.name'],
            raw: true
        });
        console.log('✅ News by Category:', JSON.stringify(newsByCategory, null, 2));

        console.log('\n🔄 Testing News by Day...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newsByDay = await News.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('publishedAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                publishedAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('publishedAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('publishedAt')), 'ASC']],
            raw: true
        });
        console.log('✅ News by Day:', JSON.stringify(newsByDay, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
})();
