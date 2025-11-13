// server/routes/cart.routes.js
const { Cart, Product, User } = require('../database/models');
const express = require('express');
const { verifyToken } = require('../utils/token.js');

const router = express.Router();

// Add product to cart
router.post('/', verifyToken, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.userId;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                data: {}
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
                data: {}
            });
        }

        const existingCartItem = await Cart.findOne({
            where: {
                userId,
                productId
            }
        });

        let cartItem;
        if (existingCartItem) {
            const newQuantity = existingCartItem.quantity + quantity;
            
            if (product.stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock',
                    data: {}
                });
            }

            await existingCartItem.update({ quantity: newQuantity });
            cartItem = existingCartItem;
        } else {
            cartItem = await Cart.create({
                userId,
                productId,
                quantity
            });
        }

        const cartItemWithProduct = await Cart.findByPk(cartItem.id, {
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Product added to cart',
            data: cartItemWithProduct
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding product to cart',
            data: error.message
        });
    }
});

// Get cart items (user's own cart or specific user cart for admin)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { userEmail } = req.query;
        let userId = req.userId;

        if (req.userRole === 'admin' && userEmail) {
            const user = await User.findOne({ where: { email: userEmail } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    data: {}
                });
            }
            userId = user.id;
        }

        const cartItems = await Cart.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product'
            }],
            order: [['created_at', 'DESC']]
        });

        const total = cartItems.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            data: {
                items: cartItems,
                total: total
            }
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            data: error.message
        });
    }
});

// Update cart item quantity
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart item id',
                data: {}
            });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1',
                data: {}
            });
        }

        const cartItem = await Cart.findByPk(id, {
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found',
                data: {}
            });
        }

        if (cartItem.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                data: {}
            });
        }

        if (cartItem.product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
                data: {}
            });
        }

        await cartItem.update({ quantity });

        const updatedCartItem = await Cart.findByPk(id, {
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        res.status(200).json({
            success: true,
            message: 'Cart item updated',
            data: updatedCartItem
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating cart item',
            data: error.message
        });
    }
});

// Delete cart item
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart item id',
                data: {}
            });
        }

        const cartItem = await Cart.findByPk(id);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found',
                data: {}
            });
        }

        if (cartItem.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                data: {}
            });
        }

        await cartItem.destroy();

        res.status(200).json({
            success: true,
            message: 'Cart item removed',
            data: {}
        });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing cart item',
            data: error.message
        });
    }
});

// Clear entire cart
router.delete('/', verifyToken, async (req, res) => {
    try {
        await Cart.destroy({
            where: { userId: req.userId }
        });

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: {}
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            data: error.message
        });
    }
});

// Get all users (for admin dropdown)
router.get('/users/list', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                data: {}
            });
        }

        const users = await User.findAll({
            attributes: ['id', 'email', 'name'],
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            data: error.message
        });
    }
});

module.exports = router;