// server/database/models/Cart.js
const { sequelize } = require('../server');
const { DataTypes } = require('sequelize');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'User ID is required'
      }
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'Product ID is required'
      }
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: 'Quantity must be at least 1'
      },
      isInt: {
        msg: 'Quantity must be an integer'
      }
    }
  }
}, {
  tableName: 'carts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Cart;