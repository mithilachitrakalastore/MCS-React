import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Shield, Store, ShoppingBag, MapPin, Phone, Mail, Clock, CheckCircle, Package, Truck, CreditCard, FileText, X, Heart } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { dbService } from '../services/dbservices';
import { InvoiceView } from '../components/InvoiceView';
import { ProductCard } from '../components/ProductCard';

export const ProfilePage = ({ currentUser, setCurrentUser, wishlist, products, toggleWishlist, addToCart }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [phone, setPhone] = useState(currentUser.phone || '');
    const [address, setAddress] = useState(currentUser.address || '');
    const [city, setCity] = useState(currentUser.city || '');
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        const loadOrders = async () => {
            if (currentUser.role === 'customer') {
                const data = await dbService.getOrders(undefined, currentUser.id);
                setOrders(data);
            } else if (currentUser.role === 'admin') {
                const data = await dbService.getOrders();
                setOrders(data);
            }
            setLoading(false);
        };
        loadOrders();
    }, [currentUser]);

    const logout = () => {
        setCurrentUser(null);
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await dbService.updateOrderStatus(orderId, 'cancelled', currentUser.role, currentUser.id);
                const data = await dbService.getOrders(undefined, currentUser.id);
                setOrders(data);
            } catch (error) {
                alert('Failed to cancel order. Please try again.');
            }
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updatedUser = await dbService.updateUser(currentUser.id, {
                phone: phone || undefined,
                address: address || undefined,
                city: city || undefined
            });
            setCurrentUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={14} />;
            case 'confirmed': return <CheckCircle size={14} />;
            case 'packing': return <Package size={14} />;
            case 'billing': return <CreditCard size={14} />;
            case 'arrived': return <MapPin size={14} />;
            case 'delivered': return <CheckCircle size={14} className="text-green-600" />;
            case 'cancelled': return <X size={14} className="text-red-600" />;
        }
    };

    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="pt-40 pb-32 px-2 sm:px-6 max-w-6xl mx-auto min-h-screen">
            <SectionHeading subtitle="Your Heritage Account" title="My Profile" centered />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Profile Card */}
                <div className="lg:col-span-4">
                    <div className="bg-[#f8f6f2] rounded-t-[6rem] rounded-b-[1rem] sm:rounded-[3rem] p-3 sm:p-10 border border-[#e5e1d8] shadow-xl sticky top-32">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-25 h-25 md:w-32 md:h-32 bg-[#5c1111] rounded-full flex items-center justify-center text-white text-5xl font-black shadow-2xl overflow-hidden">
                                <img src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=5c1111&color=fff&size=128`} alt="" className='w-full h-full object-cover rounded-[0.75rem]'/>
                            </div>
                            <div>
                                <h2 className="font-playfair text-2xl sm:text-3xl font-black text-stone-900">{currentUser.name}</h2>
                                <p className="text-stone-500 font-bold text-[10px] uppercase tracking-widest mt-1">@{currentUser.username}</p>
                            </div>
                            
                            <div className="w-full space-y-4 pt-6 border-t border-stone-200">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#5c1111] shadow-sm"><Mail size={14} /></div>
                                    <p className="text-xs font-medium text-stone-600 truncate">{currentUser.email}</p>
                                </div>
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#5c1111] shadow-sm"><Phone size={14} /></div>
                                    {isEditing ? (
                                        <input
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            type="tel"
                                            placeholder="Phone number"
                                            className="flex-1 text-xs font-medium text-stone-600 bg-[#efece6] rounded-lg px-3 py-2 outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20"
                                        />
                                    ) : (
                                        <p className="text-xs font-medium text-stone-600">{currentUser.phone || 'Not provided'}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#5c1111] shadow-sm"><MapPin size={14} /></div>
                                    {isEditing ? (
                                        <input
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            type="text"
                                            placeholder="Address"
                                            className="flex-1 text-xs font-medium text-stone-600 bg-[#efece6] rounded-lg px-3 py-2 outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20"
                                        />
                                    ) : (
                                        <p className="text-xs font-medium text-stone-600">{currentUser.address || 'No address saved'}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#5c1111] shadow-sm"><MapPin size={14} /></div>
                                    {isEditing ? (
                                        <input
                                            value={city}
                                            onChange={e => setCity(e.target.value)}
                                            type="text"
                                            placeholder="City"
                                            className="flex-1 text-xs font-medium text-stone-600 bg-[#efece6] rounded-lg px-3 py-2 outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20"
                                        />
                                    ) : (
                                        <p className="text-xs font-medium text-stone-600">{currentUser.city || 'No city saved'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-3 pt-6">
                                {currentUser.role !== 'customer' && (
                                    <Link to="/seller" className="w-full bg-[#2a2723] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5c1111] transition-all">
                                        <Store size={14} /> Access Dashboard
                                    </Link>
                                )}
                                <button onClick={logout} className="w-full bg-white border border-stone-200 text-[#5c1111] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center justify-center gap-2">
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Tab Buttons */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                                activeTab === 'orders' 
                                ? 'bg-[#5c1111] text-white shadow-lg' 
                                : 'text-stone-500 hover:text-stone-900 hover:bg-white/50 bg-white'
                            }`}
                        >
                            <ShoppingBag size={14} /> 
                            {currentUser.role === 'admin' ? 'All Orders' : 'My Orders'}
                        </button>
                        <button
                            onClick={() => setActiveTab('wishlist')}
                            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                                activeTab === 'wishlist' 
                                ? 'bg-[#5c1111] text-white shadow-lg' 
                                : 'text-stone-500 hover:text-stone-900 hover:bg-white/50 bg-white'
                            }`}
                        >
                            <Heart size={14} /> 
                            Wishlist
                            {wishlist.length > 0 && (
                                <span className="ml-1 bg-amber-600 text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center">{wishlist.length}</span>
                            )}
                        </button>
                    </div>

                    {/* Wishlist Tab */}
                    {activeTab === 'wishlist' && (
                        <div className="animate-in fade-in duration-300">
                            <h3 className="font-playfair text-3xl font-black text-stone-900 flex items-center gap-4 mb-8">
                                <Heart className="text-[#5c1111]" /> 
                                My Wishlist
                            </h3>

                            {wishlistProducts.length === 0 ? (
                                <div className="text-center py-20 bg-[#f8f6f2] rounded-[4rem] border border-dashed border-stone-200">
                                    <Heart size={48} className="mx-auto text-stone-200 mb-6" />
                                    <h4 className="font-playfair text-3xl font-black text-stone-900 mb-3">No Saved Artworks</h4>
                                    <p className="text-stone-400 font-light max-w-xs mx-auto mb-8">Start adding artworks you love to your wishlist.</p>
                                    <Link to="/products" className="inline-flex items-center gap-3 bg-[#5c1111] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        Browse Gallery <Truck size={14} />
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {wishlistProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            addToCart={addToCart}
                                            isWishlisted={true}
                                            toggleWishlist={toggleWishlist}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="animate-in fade-in duration-300">
                            <h3 className="font-playfair text-3xl font-black text-stone-900 flex items-center gap-4 mb-8">
                                <ShoppingBag className="text-[#5c1111]" /> 
                                {currentUser.role === 'admin' ? 'Global Order Registry' : 'My Order'}
                            </h3>

                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-stone-100 rounded-3xl"></div>)}
                                </div>
                            ) : orders.length > 0 ? (
                                <div className="space-y-1">
                                    {orders.map(order => (
                                        <div key={order.id} className="bg-white rounded-[1rem] sm:rounded-[2.5rem] border border-[#e5e1d8] overflow-hidden hover:shadow-2xl transition-all group">
                                            <div className="bg-[#f8f6f2] px-1 sm:px-8 py-2 sm:py-4 flex justify-between items-center border-b border-[#e5e1d8]">
                                                <div>
                                                    <span className="text-[10px] font-black tracking-widest uppercase text-stone-400">Order #{order.id}</span>
                                                    {order.tracking_id && (
                                                        <span className="text-[9px] font-bold tracking-widest uppercase text-stone-300 ml-3">Tracking: {order.tracking_id}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 bg-[#5c1111] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    {getStatusIcon(order.status)} {order.status}
                                                </div>
                                            </div>
                                            <div className="p-2 sm:p-8 flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex gap-2 sm:gap-6">
                                                    <div className="flex -space-x-4">
                                                        {order.items.slice(0, 3).map((item, idx) => (
                                                            <Link key={idx} to={`/product/${item.slug}`} className="block hover:scale-110 transition-transform z-10 hover:z-20">
                                                                <img src={item.image} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg cursor-pointer" alt={item.name} />
                                                            </Link>
                                                        ))}
                                                        {order.items.length > 3 && (
                                                            <div className="w-16 h-16 rounded-2xl bg-stone-200 flex items-center justify-center text-[10px] font-black border-4 border-white shadow-lg">+{order.items.length - 3}</div>
                                                        )}
                                                    </div> 
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{new Date(order.date).toLocaleDateString()}</p>
                                                        <Link to={`/product/${order.items[0].slug}`} className="hover:text-[#5c1111] transition-colors">
                                                            <h4 className="font-playfair text-xm sm:text-xl font-black text-stone-900">{order.items[0].name}{order.items.length > 1 ? ' & more' : ''}</h4>
                                                        </Link>
                                                        <p className="text-xs text-stone-500 mt-1">Status: {order.status === 'delivered' ? 'Completed' : 'In transit'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col justify-center items-end">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${order.customer_payment_status === 'done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            Payment: {order.customer_payment_status}
                                                        </span>
                                                        {order.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        )}
                                                        {currentUser.role === 'admin' && ['packing', 'billing', 'arrived', 'delivered'].includes(order.status) && (
                                                            <button onClick={() => setInvoiceOrder(order)} className="flex items-center gap-2 text-[#5c1111] font-black text-[9px] uppercase tracking-widest hover:underline">
                                                                <FileText size={14} /> View Bill
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-2xl font-playfair font-black text-[#5c1111]">रु {order.total.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Tracking Bar */}
                                            <div className="px-4 sm:px-8 pb-4 sm:pb-8">
                                                <div className="flex justify-between relative">
                                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2 z-0"></div>
                                                    {['pending', 'confirmed', 'packing', 'billing', 'arrived', 'delivered', 'cancelled'].map((s, idx) => {
                                                        const steps = ['pending', 'confirmed', 'packing', 'billing', 'arrived', 'delivered', 'cancelled'];
                                                        const currentIdx = steps.indexOf(order.status);
                                                        const isPast = idx <= currentIdx && order.status !== 'cancelled';
                                                        const isCancelled = order.status === 'cancelled' && s === 'cancelled';
                                                        return (
                                                            <div key={s} className="relative z-10 flex flex-col items-center">
                                                                <div className={`w-3 h-3 rounded-full border-2 ${isPast || isCancelled ? (isCancelled ? 'bg-red-600 border-red-600' : 'bg-[#5c1111] border-[#5c1111]') : 'bg-white border-stone-200'}`}></div>
                                                                <span className={`text-[7px] font-black uppercase mt-2 tracking-tighter ${(isPast || isCancelled) ? (isCancelled ? 'text-red-600' : 'text-[#5c1111]') : 'text-stone-300'}`}>{s}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-40 bg-[#f8f6f2] rounded-[1rem] sm:rounded-[4rem] border border-dashed border-stone-200">
                                    <ShoppingBag size={48} className="mx-auto text-stone-200 mb-6" />
                                    <h4 className="font-playfair text-3xl font-black text-stone-900 mb-3">Your Gallery is Silent</h4>
                                    <p className="text-stone-400 font-light max-w-xs mx-auto mb-8">No masterpieces have been commissioned yet. Start your art journey today.</p>
                                    <Link to="/products" className="inline-flex items-center gap-3 bg-[#5c1111] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        Browse The Vault <Truck size={14} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Viewer */}
            {invoiceOrder && (
                <InvoiceView 
                    order={invoiceOrder} 
                    onClose={() => setInvoiceOrder(null)} 
                    role={currentUser.role} 
                />
            )}
        </div>
    );
};
