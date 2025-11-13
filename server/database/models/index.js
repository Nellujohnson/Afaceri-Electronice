// server/database/models/index.js
const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');

// User -> Cart (one-to-many)
User.hasMany(Cart, {
  foreignKey: 'userId',
  as: 'cartItems'
});
Cart.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Product -> Cart (one-to-many)
Product.hasMany(Cart, {
  foreignKey: 'productId',
  as: 'cartItems'
});
Cart.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

module.exports = { User, Product, Cart };