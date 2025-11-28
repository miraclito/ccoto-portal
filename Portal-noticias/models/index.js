const { sequelize } = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const News = require('./News');
const Payment = require('./Payment');
const Source = require('./Source');

// Relaciones

// News belongs to Category
News.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// Category has many News
Category.hasMany(News, {
  foreignKey: 'categoryId',
  as: 'news'
});

// News belongs to User (author)
News.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});

// User has many News
User.hasMany(News, {
  foreignKey: 'authorId',
  as: 'news'
});

// Payment belongs to User
Payment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User has many Payments
User.hasMany(Payment, {
  foreignKey: 'userId',
  as: 'payments'
});

module.exports = {
  User,
  Category,
  News,
  Payment,
  Source,
  sequelize
};
