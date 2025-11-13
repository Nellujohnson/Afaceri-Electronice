// client/src/api/cart.routes.js
import axiosAuth from "../axios/axiosAuth";

export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await axiosAuth.post('/cart', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return error.response?.data;
  }
};

export const fetchCart = async (userEmail = null) => {
  try {
    const url = userEmail ? `/cart?userEmail=${userEmail}` : '/cart';
    const response = await axiosAuth.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return error.response?.data;
  }
};

export const updateCartItem = async (id, quantity) => {
  try {
    const response = await axiosAuth.put(`/cart/${id}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    return error.response?.data;
  }
};

export const removeFromCart = async (id) => {
  try {
    const response = await axiosAuth.delete(`/cart/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return error.response?.data;
  }
};

export const clearCart = async () => {
  try {
    const response = await axiosAuth.delete('/cart');
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return error.response?.data;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await axiosAuth.get('/cart/users/list');
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return error.response?.data;
  }
};