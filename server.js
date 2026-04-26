import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// We recommend using the SERVICE_ROLE_KEY here for secure backend operations
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
}
if (!geminiApiKey) {
    console.error("Missing Gemini API credentials in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

const hashPassword = (pwd) => btoa(`mks-salt-${pwd}`);

const logAction = async (action, adminId) => {
    await supabase.from('logs').insert([{
        id: `l-${Math.random().toString(36).substr(2, 9)}`,
        action,
        admin_id: adminId,
        timestamp: new Date().toISOString()
    }]);
};

// --- Gemini API Route ---
app.post('/api/gemini', async (req, res) => {
    try {
        const { userPrompt } = req.body;
        const result = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: userPrompt,
            config: {
                systemInstruction: `You are an expert art consultant specializing in Mithila (Maithili) art, 
                also known as Madhubani art. You are deeply knowledgeable about its history, 
                symbolism, traditional techniques, and the cultural heritage of the Mithila region.
                Keep your responses concise but impactful.`
            }
        });
        res.json({ text: result.text });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- Supabase DB Proxy Route ---
app.post('/api/db', async (req, res) => {
    try {
        const { action, payload } = req.body;
        let result = null;

        switch (action) {
            case 'login': {
                const { username, password } = payload;
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', username)
                    .eq('password_hash', hashPassword(password))
                    .single();
                if (error || !data || data.status !== 'active') result = null;
                else result = data;
                break;
            }
            case 'register': {
                const { userData } = payload;
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
                result = (data && data.length > 0) ? data[0] : newUser;
                break;
            }
            case 'getUserByEmail': {
                const { email } = payload;
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .maybeSingle(); // maybeSingle instead of single so it doesn't throw if not found
                
                if (error) throw new Error(error.message);
                if (!data || data.status !== 'active') result = null;
                else result = data;
                break;
            }
            case 'registerGoogleUser': {
                const { picture, ...restUserData } = payload.userData;
                const newUser = {
                    id: `u-${Math.random().toString(36).substr(2, 9)}`,
                    role: 'customer',
                    status: 'active',
                    avatar_url: picture,
                    ...restUserData
                };
                const { data, error } = await supabase.from('users').insert([newUser]).select();
                if (error) throw new Error(error.message);
                
                result = (data && data.length > 0) ? data[0] : newUser;
                break;
            }
            case 'getUsers': {
                const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
                if (error) throw new Error(error.message);
                result = data;
                break;
            }
            case 'updateUser': {
                const { userId, userData } = payload;
                const { data, error } = await supabase.from('users').update(userData).eq('id', userId).select();
                if (error) throw new Error(error.message);
                result = data[0];
                break;
            }
            case 'updateUserStatus': {
                const { id, status, adminId } = payload;
                const { error } = await supabase.from('users').update({ status }).eq('id', id);
                if (error) throw new Error(error.message);
                if (adminId) await logAction(`Admin updated user ${id} status to ${status}`, adminId);
                result = { success: true };
                break;
            }
            case 'getGlobalCommission': {
                const { data, error } = await supabase.from('app_config').select('globalCommission').single();
                if (error) throw new Error(error.message);
                result = { globalCommission: data.globalCommission };
                break;
            }
            case 'setGlobalCommission': {
                const { commission, adminId } = payload;
                const { error } = await supabase.from('app_config').update({ globalCommission: commission }).eq('id', 1);
                if (error) throw new Error(error.message);
                if (adminId) await logAction(`Admin updated global commission to ${commission}%`, adminId);
                result = { success: true };
                break;
            }
            case 'getProducts': {
                const { sellerId } = payload;
                let query = supabase.from('products').select('*');
                if (sellerId) query = query.eq('seller_id', sellerId);
                const { data, error } = await query;
                if (error) throw new Error(error.message);
                result = data;
                break;
            }
            case 'addProduct': {
                const { productData } = payload;
                const { data, error } = await supabase.from('products').insert([productData]).select();
                if (error) throw new Error(error.message);
                result = data[0];
                break;
            }
            case 'getOrders': {
                const { sellerId, customerId } = payload;
                let query = supabase.from('orders').select('*').order('date', { ascending: false });
                if (sellerId) query = query.eq('seller_id', sellerId);
                if (customerId) query = query.eq('customer_id', customerId);
                const { data, error } = await query;
                if (error) throw new Error(error.message);
                result = data;
                break;
            }
            case 'saveOrder': {
                const { order } = payload;
                const configData = await supabase.from('app_config').select('globalCommission').single();
                const perc = configData.data?.globalCommission || 12;
                const commAmt = (order.total * perc) / 100;
                const sellerAmt = order.total - commAmt;

                const now = new Date();
                const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
                const invoiceSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
                const invoiceNo = `INV-${dateStr}-${invoiceSuffix}`;
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
                result = data[0];
                break;
            }
            case 'updateOrderStatus': {
                const { id, status, role, userId } = payload;
                let updateData = { status };
                if (status === 'cancelled') {
                    updateData.payment_status = 'cancelled';
                    updateData.customer_payment_status = 'cancelled';
                }
                const { error } = await supabase.from('orders').update(updateData).eq('id', id);
                if (error) throw new Error(error.message);
                if (role === 'admin') await logAction(`Admin forced status ${status} on order ${id}`, userId);
                result = { success: true };
                break;
            }
            case 'confirmPayout': {
                const { orderId, adminId } = payload;
                const { error } = await supabase.from('orders').update({
                    payment_status: 'paid',
                    mks_payment_status: 'done'
                }).eq('id', orderId);
                if (error) throw new Error(error.message);
                if (adminId) await logAction(`Admin confirmed payout for order ${orderId}`, adminId);
                result = { success: true };
                break;
            }
            case 'updateCustomerPaymentVerified': {
                const { orderId, verified, adminId } = payload;
                const { error } = await supabase.from('orders').update({
                    customer_payment_verified: verified,
                    customer_payment_status: verified ? 'done' : 'pending'
                }).eq('id', orderId);
                if (error) throw new Error(error.message);
                if (adminId) await logAction(`Admin verified customer payment for order ${orderId}`, adminId);
                result = { success: true };
                break;
            }
            case 'getLogs': {
                const { data, error } = await supabase.from('logs').select('*').order('timestamp', { ascending: false });
                if (error) throw new Error(error.message);
                result = data;
                break;
            }
            case 'addReview': {
                const { reviewData } = payload;
                const { data, error } = await supabase.from('reviews').insert([{
                    id: `r-${Math.random().toString(36).substr(2, 9)}`,
                    date: new Date().toISOString(),
                    ...reviewData
                }]).select();
                if (error) throw new Error(error.message);
                result = data[0];
                break;
            }
            case 'getReviews': {
                const { productId } = payload;
                const { data: reviews, error: reviewError } = await supabase
                    .from('reviews')
                    .select('*')
                    .eq('productId', productId)
                    .order('date', { ascending: false });
                
                if (reviewError) throw new Error(reviewError.message);

                if (reviews && reviews.length > 0) {
                    const userIds = [...new Set(reviews.filter(r => r.userId).map(r => r.userId))];
                    if (userIds.length > 0) {
                        const { data: users, error: userError } = await supabase
                            .from('users')
                            .select('id, avatar_url, name')
                            .in('id', userIds);
                        
                        if (!userError && users) {
                            const userMap = Object.fromEntries(users.map(u => [u.id, u]));
                            result = reviews.map(r => ({
                                ...r,
                                user: userMap[r.userId] || null
                            }));
                        } else {
                            result = reviews;
                        }
                    } else {
                        result = reviews;
                    }
                } else {
                    result = reviews;
                }
                break;
            }
            case 'getWishlists': {
                const { sellerId } = payload;
                const { data, error } = await supabase.from('wishlists').select('*, product:products!productId(*), customer:users!userId(*)');
                if (error) throw new Error(error.message);
                if (sellerId) {
                    result = data.filter((w) => w.product && w.product.seller_id === sellerId);
                } else {
                    result = data;
                }
                break;
            }
            case 'addToWishlist': {
                const { userId, productId } = payload;
                const { data, error } = await supabase.from('wishlists').insert([{
                    id: `w-${Math.random().toString(36).substr(2, 9)}`,
                    userId,
                    productId
                }]).select();
                if (error) throw new Error(error.message);
                result = data[0];
                break;
            }
            case 'removeFromWishlist': {
                const { userId, productId } = payload;
                const { error } = await supabase.from('wishlists').delete().eq('userId', userId).eq('productId', productId);
                if (error) throw new Error(error.message);
                result = { success: true };
                break;
            }
            default:
                throw new Error('Invalid action');
        }

        res.json(result);
    } catch (error) {
        console.error("DB Service Error:", error);
        res.status(400).json({ error: error.message });
    }
});

app.use(express.static(path.join(__dirname, 'dist')));


// Handle SPA routing: send all non-API requests to index.html
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
}); 

app.listen(PORT, () => {
    console.log(`Node Server running on http://localhost:${PORT}`);
});
