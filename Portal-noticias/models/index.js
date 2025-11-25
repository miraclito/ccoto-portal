const User = require('./User');
const Category = require('./Category');
const News = require('./News');

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

module.exports = {
  User,
  Category,
  News
};
