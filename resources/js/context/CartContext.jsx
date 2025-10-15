import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [count, setCount] = useState(0);
    const [items, setItems] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('printair_cart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                setItems(cartData.items || []);
                setCount(cartData.items?.length || 0);
            } catch (e) {
                console.error('Failed to load cart:', e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('printair_cart', JSON.stringify({ items, count }));
    }, [items, count]);

    const addToCart = (product) => {
        setItems(prev => [...prev, product]);
        setCount(prev => prev + 1);
    };

    const removeFromCart = (productId) => {
        setItems(prev => prev.filter(item => item.id !== productId));
        setCount(prev => Math.max(0, prev - 1));
    };

    const clearCart = () => {
        setItems([]);
        setCount(0);
    };

    return (
        <CartContext.Provider value={{ count, items, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        // Return default values if provider is not available
        return {
            count: 0,
            items: [],
            addToCart: () => {},
            removeFromCart: () => {},
            clearCart: () => {}
        };
    }
    return context;
};

export default CartContext;
