const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||'/api';

const callDbService = async (action, payload = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/db`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, payload })
        });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({}));
             throw new Error(errorData.error || `Server returned ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`DB Service Error [${action}]:`, error);
        throw error;
    }
};

export const dbService = {
    login: (username, password) => callDbService('login', { username, password }),
    register: (userData) => callDbService('register', { userData }),
    getUsers: () => callDbService('getUsers'),
    updateUser: (userId, userData) => callDbService('updateUser', { userId, userData }),
    updateUserStatus: (id, status, adminId) => callDbService('updateUserStatus', { id, status, adminId }),
    getGlobalCommission: () => callDbService('getGlobalCommission'),
    setGlobalCommission: (commission, adminId) => callDbService('setGlobalCommission', { commission, adminId }),
    getProducts: (sellerId) => callDbService('getProducts', { sellerId }),
    addProduct: (productData) => callDbService('addProduct', { productData }),
    getOrders: (sellerId, customerId) => callDbService('getOrders', { sellerId, customerId }),
    saveOrder: (order) => callDbService('saveOrder', { order }),
    updateOrderStatus: (id, status, role, userId) => callDbService('updateOrderStatus', { id, status, role, userId }),
    confirmPayout: (orderId, adminId) => callDbService('confirmPayout', { orderId, adminId }),
    updateCustomerPaymentVerified: (orderId, verified, adminId) => callDbService('updateCustomerPaymentVerified', { orderId, verified, adminId }),
    getLogs: () => callDbService('getLogs'),
    addReview: (reviewData) => callDbService('addReview', { reviewData }),
    getReviews: (productId) => callDbService('getReviews', { productId }),
    getWishlists: (sellerId) => callDbService('getWishlists', { sellerId }),
    addToWishlist: (userId, productId) => callDbService('addToWishlist', { userId, productId }),
    removeFromWishlist: (userId, productId) => callDbService('removeFromWishlist', { userId, productId })
};
