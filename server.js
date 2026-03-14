import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Utility functions
const hashPassword = (pwd) => Buffer.from(`mks-salt-${pwd}`).toString('base64');

const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
    }
};




// API Routes

// Auth
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJsonFile(USERS_FILE);
    const user = users.find(u => u.username === username && u.password_hash === hashPassword(password));
    if (user && user.status === 'active') {
        res.json(user);
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/register', (req, res) => {
    const userData = req.body;
    const users = readJsonFile(USERS_FILE);
    const { password_hash: plainPassword, ...otherData } = userData; // Extract password_hash as plainPassword
    const newUser = {
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        username: otherData.username,
        name: otherData.name,
        email: otherData.email,
        role: otherData.role || 'customer',
        status: otherData.role === 'seller' ? 'disabled' : 'active',
        password: plainPassword, // Store plain text password
        password_hash: hashPassword(plainPassword), // Store hashed password for login
        ...otherData
    };
    users.push(newUser);
    writeJsonFile(USERS_FILE, users);
    res.json(newUser);
});

// Users
app.get('/api/users', (req, res) => {
    const users = readJsonFile(USERS_FILE);
    res.json(users);
});

app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const userData = req.body;
    const users = readJsonFile(USERS_FILE);
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user data and add lastProfileEdit timestamp
    const updatedUser = {
        ...users[userIndex],
        ...userData,
        lastProfileEdit: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    writeJsonFile(USERS_FILE, users);
    
    res.json(updatedUser);
});

app.put('/api/users/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, adminId } = req.body;
    const users = readJsonFile(USERS_FILE);
    const updated = users.map(u => u.id === id ? { ...u, status } : u);
    writeJsonFile(USERS_FILE, updated);

    // Log action
    const logs = readJsonFile(LOGS_FILE);
    logs.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        admin_id: adminId,
        action: `Admin ${adminId} updated user ${id} status to ${status}`
    });
    writeJsonFile(LOGS_FILE, logs);

    res.json({ success: true });
});

// Config
app.get('/api/config/commission', (req, res) => {
    const config = readJsonFile(CONFIG_FILE);
    res.json(config.globalCommission || 12);
});

app.put('/api/config/commission', (req, res) => {
    const { commission, adminId } = req.body;
    writeJsonFile(CONFIG_FILE, { globalCommission: commission });

    // Log action
    const logs = readJsonFile(LOGS_FILE);
    logs.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        admin_id: adminId,
        action: `Admin ${adminId} updated global commission to ${commission}%`
    });
    writeJsonFile(LOGS_FILE, logs);

    res.json({ success: true });
});

// Products
app.get('/api/products', (req, res) => {
    const { sellerId } = req.query;
    let products = readJsonFile(PRODUCTS_FILE);
    const users = readJsonFile(USERS_FILE);
    if (sellerId) {
        products = products.filter(p => p.seller_id === sellerId);
    } else {
        // For customer view, filter out products from deactivated sellers
        const activeSellerIds = users.filter(u => u.role === 'seller' && u.status === 'active').map(u => u.id);
        products = products.filter(p => activeSellerIds.includes(p.seller_id));
    }
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const productData = req.body;
    const products = readJsonFile(PRODUCTS_FILE);
    const users = readJsonFile(USERS_FILE);
    const seller = users.find(u => u.id === productData.seller_id);
    if (!seller || seller.role !== 'seller' || seller.status !== 'active') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    const newProduct = {
        id: `p-${Math.random().toString(36).substr(2, 9)}`,
        ...productData,
        rating: 0,
        reviewCount: 0,
        storeName: seller.storeName,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    };
    products.push(newProduct);
    writeJsonFile(PRODUCTS_FILE, products);
    res.json(newProduct);
});

// Orders
app.get('/api/orders', (req, res) => {
    const { sellerId, customerId } = req.query;
    let orders = readJsonFile(ORDERS_FILE);
    if (sellerId) orders = orders.filter(o => o.seller_id === sellerId);
    if (customerId) orders = orders.filter(o => o.customer_id === customerId);
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const order = req.body;
    const orders = readJsonFile(ORDERS_FILE);
    orders.push(order);
    writeJsonFile(ORDERS_FILE, orders);
    res.json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, role, userId } = req.body;
    const orders = readJsonFile(ORDERS_FILE);
    const config = readJsonFile(CONFIG_FILE);
    const commissionPct = config.globalCommission || 12;

    const updated = orders.map(o => {
        if (o.id === id) {
            if (role === 'seller' && o.seller_id !== userId) return o;
            if (role === 'customer' && o.customer_id !== userId) return o;

            const updatedOrder = { ...o, status };
            if (status === 'delivered') updatedOrder.deliveredAt = new Date().toISOString();

            if (!o.invoice_no && ['packing', 'billing', 'arrived', 'delivered'].includes(status)) {
                updatedOrder.invoice_no = `MKS-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            }

            if (['packing', 'billing', 'arrived', 'delivered'].includes(status)) {
                updatedOrder.commission_percentage = commissionPct;
                updatedOrder.commission_amount = (o.total * commissionPct) / 100;
                updatedOrder.seller_payable_amount = o.total - updatedOrder.commission_amount;
            } else if (status === 'cancelled') {
                // Reset commission fields for cancelled orders
                updatedOrder.commission_percentage = 0;
                updatedOrder.commission_amount = 0;
                updatedOrder.seller_payable_amount = 0;
            }

            return updatedOrder;
        }
        return o;
    });
    writeJsonFile(ORDERS_FILE, updated);

    // Reduce stock when order status is confirmed
    if (status === 'confirmed') {
        const products = readJsonFile(PRODUCTS_FILE);
        const order = updated.find(o => o.id === id);
        if (order) {
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product && product.stock >= item.quantity) {
                    product.stock -= item.quantity;
                }
            });
            writeJsonFile(PRODUCTS_FILE, products);
        }
    }

    if (role === 'admin') {
        const logs = readJsonFile(LOGS_FILE);
        logs.push({
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            admin_id: userId,
            action: `Admin forced status ${status} on order ${id}`
        });
        writeJsonFile(LOGS_FILE, logs);
    }

    res.json({ success: true });
});

app.put('/api/orders/:id/payout', (req, res) => {
    const { id } = req.params;
    const { adminId } = req.body;
    const orders = readJsonFile(ORDERS_FILE);
    const updated = orders.map(o => o.id === id ? { ...o, mks_payment_status: 'done' } : o);
    writeJsonFile(ORDERS_FILE, updated);

    const logs = readJsonFile(LOGS_FILE);
    logs.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        admin_id: adminId,
        action: `Admin confirmed payout for order ${id}`
        });
    writeJsonFile(LOGS_FILE, logs);

    res.json({ success: true });
});

app.put('/api/orders/:id/verify-payment', (req, res) => {
    const { id } = req.params;
    const { verified, adminId } = req.body;
    const orders = readJsonFile(ORDERS_FILE);
    const updated = orders.map(o => o.id === id ? { ...o, customer_payment_verified: verified } : o);
    writeJsonFile(ORDERS_FILE, updated);

    const logs = readJsonFile(LOGS_FILE);
    logs.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        admin_id: adminId,
        action: `Admin ${verified ? 'verified' : 'unverified'} customer payment for order ${id}`
    });
    writeJsonFile(LOGS_FILE, logs);

    res.json({ success: true });
});

// Logs
app.get('/api/logs', (req, res) => {
    const logs = readJsonFile(LOGS_FILE);
    res.json(logs);
});

// Reviews
app.post('/api/reviews', (req, res) => {
    const reviewData = req.body;
    const reviews = readJsonFile(REVIEWS_FILE);
    const products = readJsonFile(PRODUCTS_FILE);

    const newReview = {
        id: `rev-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        ...reviewData
    };
    reviews.push(newReview);
    writeJsonFile(REVIEWS_FILE, reviews);

    // Update product statistics
    const updatedProducts = products.map(p => {
        if (p.id === reviewData.productId) {
            const pReviews = reviews.filter(r => r.productId === p.id).concat(newReview);
            const avg = pReviews.reduce((acc, r) => acc + r.rating, 0) / pReviews.length;
            return { ...p, rating: parseFloat(avg.toFixed(1)), reviewCount: pReviews.length };
        }
        return p;
    });
    writeJsonFile(PRODUCTS_FILE, updatedProducts);

    res.json(newReview);
});

app.get('/api/reviews/:productId', (req, res) => {
    const { productId } = req.params;
    const reviews = readJsonFile(REVIEWS_FILE);
    const productReviews = reviews.filter(r => r.productId === productId);
    res.json(productReviews);
});

// Wishlists - Get wishlists for a seller
app.get('/api/wishlists', (req, res) => {
    const { sellerId } = req.query;
    const wishlists = readJsonFile(WISHLISTS_FILE);
    const products = readJsonFile(PRODUCTS_FILE);
    const users = readJsonFile(USERS_FILE);
    
    let filteredWishlists = wishlists;
    
    if (sellerId) {
        const sellerProductIds = products.filter(p => p.seller_id === sellerId).map(p => p.id);
        filteredWishlists = wishlists.filter(w => w.productId && sellerProductIds.includes(w.productId));
    }
    
    const enrichedWishlists = filteredWishlists.map(w => {
        const product = products.find(p => p.id === w.productId);
        const user = users.find(u => u.id === w.userId);
        return {
            ...w,
            product: product ? { id: product.id, name: product.name, image: product.image, price: product.price } : null,
            customer: user ? { id: user.id, name: user.name, email: user.email } : null
        };
    });
    
    res.json(enrichedWishlists);
});

// Wishlists - Add to wishlist
app.post('/api/wishlists', (req, res) => {
    const { userId, productId } = req.body;
    const wishlists = readJsonFile(WISHLISTS_FILE);
    const products = readJsonFile(PRODUCTS_FILE);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const existing = wishlists.find(w => w.userId === userId && w.productId === productId);
    if (existing) {
        return res.json(existing);
    }
    
    const newWishlistItem = {
        id: `w-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        productId,
        addedAt: new Date().toISOString()
    };
    
    wishlists.push(newWishlistItem);
    writeJsonFile(WISHLISTS_FILE, wishlists);
    res.json(newWishlistItem);
});

// Wishlists - Remove from wishlist
app.delete('/api/wishlists', (req, res) => {
    const { userId, productId } = req.body;
    const wishlists = readJsonFile(WISHLISTS_FILE);
    const filtered = wishlists.filter(w => !(w.userId === userId && w.productId === productId));
    writeJsonFile(WISHLISTS_FILE, filtered);
    res.json({ success: true });
});

// Initialize DB and start server

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
 