import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const hashPassword = (pwd) => btoa(`mks-salt-${pwd}`);

const logAction = async (action, adminId) => {
    await supabase.from('logs').insert([{
        id: `l-${Math.random().toString(36).substr(2, 9)}`,
        action,
        admin_id: adminId,
        timestamp: new Date().toISOString()
    }]);
};

export const dbService = {
    login: async (username, password) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password_hash', hashPassword(password))
            .single();
        if (error || !data || data.status !== 'active') return null;
        return data;
    },

    register: async (userData) => {
        const plainPassword = userData.password;
        const newUser = {
            id: `u-${Math.random().toString(36).substr(2, 9)}`,
            role: userData.role || 'customer',
            status: userData.role === 'seller' ? 'disabled' : 'active',
            ...userData,
            password: plainPassword,
            password_hash: hashPassword(plainPassword)
        };
        const { data, error } = await supabase.from('users').insert([newUser]).select();
        if (error) throw new Error(error.message);
        return data[0];
    },

    getUsers: async () => {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
    },

    updateUser: async (userId, userData) => {
        const { data, error } = await supabase.from('users').update(userData).eq('id', userId).select();
        if (error) throw new Error(error.message);
        return data[0];
    },

    updateUserStatus: async (id, status, adminId) => {
        const { error } = await supabase.from('users').update({ status }).eq('id', id);
        if (error) throw new Error(error.message);
        if (adminId) {
            await logAction(`Admin updated user ${id} status to ${status}`, adminId);
        }
    },

    getGlobalCommission: async () => {
        const { data, error } = await supabase.from('app_config').select('globalCommission').single();
        if (error) throw new Error(error.message);
        return { globalCommission: data.globalCommission };
    },

    setGlobalCommission: async (commission, adminId) => {
        const { error } = await supabase.from('app_config').update({ globalCommission: commission }).eq('id', 1);
        if (error) throw new Error(error.message);
        if (adminId) {
            await logAction(`Admin updated global commission to ${commission}%`, adminId);
        }
    },

    getProducts: async (sellerId) => {
        let query = supabase.from('products').select('*');
        if (sellerId) query = query.eq('seller_id', sellerId);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data;
    },

    addProduct: async (productData) => {
        const { data, error } = await supabase.from('products').insert([productData]).select();
        if (error) throw new Error(error.message);
        return data[0];
    },

    getOrders: async (sellerId, customerId) => {
        let query = supabase.from('orders').select('*').order('date', { ascending: false });
        if (sellerId) query = query.eq('seller_id', sellerId);
        if (customerId) query = query.eq('customer_id', customerId);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data;
    },

    saveOrder: async (order) => {
        // Automatically inject current global commission when placing an order
        const config = await dbService.getGlobalCommission();
        const perc = config.globalCommission || 12;
        const commAmt = (order.total * perc) / 100;
        const sellerAmt = order.total - commAmt; 

        // Generate invoice number: INV-YYYYMMDD-XXXX
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const invoiceSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
        const invoiceNo = `INV-${dateStr}-${invoiceSuffix}`;

        // Generate tracking ID: MKS-TRK-XXXXXXXX
        const trackingId = `MKS-TRK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

        const orderData = {
            ...order,
            invoice_no: invoiceNo,
            tracking_id: trackingId,
            commission_percentage: perc,
            commission_amount: commAmt,
            seller_payable_amount: sellerAmt,
            date: now.toISOString()
        };

        const { data, error } = await supabase.from('orders').insert([orderData]).select();
        if (error) throw new Error(error.message);
        return data[0];
    },

    updateOrderStatus: async (id, status, role, userId) => {
        let updateData = { status };
        // Admin overrides skip workflow strictness in classic db, keeping it simple
        if (status === 'cancelled') {
            updateData.payment_status = 'cancelled';
            updateData.customer_payment_status = 'cancelled';
        } else if (status === 'delivered') {
             // simplified logic
        }
        
        const { error } = await supabase.from('orders').update(updateData).eq('id', id);
        if (error) throw new Error(error.message);

        if (role === 'admin') {
             await logAction(`Admin forced status ${status} on order ${id}`, userId);
        }
    },

    confirmPayout: async (orderId, adminId) => {
        const { error } = await supabase.from('orders').update({
            payment_status: 'paid',
            mks_payment_status: 'done'
        }).eq('id', orderId);
        if (error) throw new Error(error.message);
        
        if (adminId) {
             await logAction(`Admin confirmed payout for order ${orderId}`, adminId);
        }
    },

    updateCustomerPaymentVerified: async (orderId, verified, adminId) => {
        const { error } = await supabase.from('orders').update({
            customer_payment_verified: verified,
            customer_payment_status: verified ? 'done' : 'pending'
        }).eq('id', orderId);
        if (error) throw new Error(error.message);

        if (adminId) {
             await logAction(`Admin verified customer payment for order ${orderId}`, adminId);
        }
    },

    getLogs: async () => {
        const { data, error } = await supabase.from('logs').select('*').order('timestamp', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
    },

    addReview: async (reviewData) => {
        const { data, error } = await supabase.from('reviews').insert([{
            id: `r-${Math.random().toString(36).substr(2, 9)}`,
            date: new Date().toISOString(),
            ...reviewData
        }]).select();
        
        if (error) throw new Error(error.message);
        
        // Update product review count & rating logic would go here ideally 
        // For simplicity matching old system, it's fine
        return data[0];
    },

    getReviews: async (productId) => {
        const { data, error } = await supabase.from('reviews').select('*').eq('productId', productId).order('date', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
    },

    getWishlists: async (sellerId) => {
        // Fetch wishlists, joining products and customers
        const { data, error } = await supabase
            .from('wishlists')
            .select('*, product:products!productId(*), customer:users!userId(*)');
        
        if (error) throw new Error(error.message);
        
        // Filter by seller id if requested
        if (sellerId) {
            return data.filter(w => w.product && w.product.seller_id === sellerId);
        }
        return data;
    },

    addToWishlist: async (userId, productId) => {
        const { data, error } = await supabase.from('wishlists').insert([{
             id: `w-${Math.random().toString(36).substr(2, 9)}`,
             userId, 
             productId
        }]).select();
        if (error) throw new Error(error.message);
        return data[0];
    },

    removeFromWishlist: async (userId, productId) => {
        const { error } = await supabase.from('wishlists').delete().eq('userId', userId).eq('productId', productId);
        if (error) throw new Error(error.message);
    }
};
