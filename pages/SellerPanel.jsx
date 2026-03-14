import React, { useState, useEffect, useRef } from 'react';
import { 
    Package, Plus, Trash2, Box, TrendingUp, ShoppingBag, 
    Printer, Eye, X, Wallet, Shield, Users, AlertCircle,
    LayoutDashboard, MapPin, Search, ChevronRight, Settings, Info, Download,
    Check, UserX, ShieldCheck, Heart, RotateCcw, Filter
} from 'lucide-react';
import { dbService } from '../services/dbservices';
import { SectionHeading } from '../components/SectionHeading';
import { Badge } from '../components/Badge';
import { InvoiceView } from '../components/InvoiceView';

// Helper Component for Sidebar Tabs
const TabBtn = ({ children, active, onClick, icon }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
            active 
            ? 'bg-[#5c1111] text-white shadow-lg' 
            : 'text-stone-500 hover:text-stone-900 hover:bg-white/50'
        }`}
    >
        {icon} {children}
    </button>
);

// Helper Component for Metric Cards
const StatCard = ({ label, value, sub, color = "text-stone-900" }) => (
    <div className="bg-white p-5 sm:p-8 rounded-[1rem] sm:rounded-[2.5rem] border border-stone-100 shadow-sm space-y-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-10 h-10 sm:w-16 sm:h-16 bg-stone-50 rounded-bl-[2rem] group-hover:bg-[#5c1111]/5 transition-colors"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-600">{label}</p>
        <h3 className={`font-playfair text-lg sm:text-3xl font-black ${color}`}>{value}</h3>
        <p className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">{sub}</p>
    </div>
);

export const SellerPanel = ({ currentUser }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [globalCommission, setGlobalCommission] = useState(15);
    const [lowStockThreshold, setLowStockThreshold] = useState(5);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: 0,
        image: '',
        category: '',
        stock: 0,
        location: '',
        material: '',
        length: '',
        delivery: '',
        instruction: '',
        authenticity: ''
    });

    const [stats, setStats] = useState({ revenue: 0, payable: 0, paid: 0, pendingPayout: 0, orderCount: 0 });

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [groupByCustomer, setGroupByCustomer] = useState(false);
    const [expandedCustomers, setExpandedCustomers] = useState({});
    const [combinedOrders, setCombinedOrders] = useState([]);

    const salesChartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => { loadData(); }, [activeTab, currentUser]);
    useEffect(() => { if (activeTab === 'dashboard' && !loading) renderCharts(); }, [activeTab, orders, loading]);

    const loadData = async () => {
        if (!refreshing) setLoading(true);
        try {
            if (currentUser.role === 'admin') {
                const [p, o, u, l, w] = await Promise.all([
                    dbService.getProducts(),
                    dbService.getOrders(),
                    dbService.getUsers(),
                    dbService.getLogs(),
                    dbService.getWishlists()
                ]);
                setProducts(p);
                setOrders(o);
                setAllUsers(u);
                setLogs(l);
                setWishlists(w);
                setGlobalCommission(dbService.getGlobalCommission());
            } else {
                const [p, o, w] = await Promise.all([
                    dbService.getProducts(currentUser.id),
                    dbService.getOrders(currentUser.id),
                    dbService.getWishlists(currentUser.id)
                ]);
                setProducts(p);
                setOrders(o);
                setWishlists(w);
            }
            calculateSellerStats();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const calculateSellerStats = () => {
        const s = { revenue: 0, payable: 0, paid: 0, pendingPayout: 0, orderCount: orders.length };
        orders.forEach(o => {
            if (o.status !== 'cancelled') {
                s.revenue += o.total;
                if (['packing', 'billing', 'arrived', 'delivered'].includes(o.status)) {
                    s.payable += o.seller_payable_amount;
                    if (o.mks_payment_status === 'done') s.paid += o.seller_payable_amount;
                    else s.pendingPayout += o.seller_payable_amount;
                }
            }
        });
        setStats(s);
    };

    const renderCharts = () => {
        if (!window.Chart || !salesChartRef.current) return;
        if (chartInstance.current) chartInstance.current.destroy();
        const ctx = salesChartRef.current.getContext('2d');
        chartInstance.current = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: orders.slice(-7).map(o => new Date(o.date).toLocaleDateString()),
                datasets: [{ 
                    label: 'Market Performance', 
                    data: orders.slice(-7).map(o => o.total), 
                    borderColor: '#5c1111', 
                    backgroundColor: 'rgba(92, 17, 17, 0.05)', 
                    fill: true, 
                    tension: 0.4 
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
            }
        });
    };

    const handleUpdateStatus = async (orderId, status) => {
        await dbService.updateOrderStatus(orderId, status, currentUser.role, currentUser.id);
        loadData();
    };

    const handleConfirmPayout = async (orderId) => {
        if (currentUser.role !== 'admin') return;
        await dbService.confirmPayout(orderId, currentUser.id);
        loadData();
    };

    const handleTogglePaymentVerification = async (orderId, verified) => {
        if (currentUser.role !== 'admin') return;
        await dbService.updateCustomerPaymentVerified(orderId, verified, currentUser.id);
        loadData();
    };

    const handleAddProduct = async () => {
        try {
            await dbService.addProduct({
                ...newProduct,
                seller_id: currentUser.id
            });
            setShowAddProductModal(false);
            setNewProduct({
                name: '',
                description: '',
                price: 0,
                image: '',
                category: '',
                stock: 0,
                location: '',
                material: '',
                length: '',
                delivery: '',
                instruction: '',
                authenticity: ''
            });
            loadData();
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const handleUserStatusUpdate = async (userId, status) => {
        if (currentUser.role !== 'admin') return;
        await dbService.updateUserStatus(userId, status, currentUser.id);
        loadData();
    };

    return (
        <div className="pt-40 pb-32 px-3 sm:px-6 max-w-7xl mx-auto min-h-screen print:p-0">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12 print:hidden">
                <div>
                    <SectionHeading 
                        subtitle={currentUser.role === 'admin' ? "Global Governance" : "Artisan Studio"} 
                        title={currentUser.role === 'admin' ? "Registry Command" : `${currentUser.storeName}`} 
                    />
                    
                    <div className="flex flex-wrap gap-2 mt-8 bg-[#efece6] p-1.5 rounded-[2rem] w-fit border border-[#d1cdc7] shadow-inner">
                        <TabBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={14}/>}>Summary</TabBtn>
                        <TabBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Box size={14}/>}>Inventory</TabBtn>
                        <TabBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={14}/>}>Orders</TabBtn>
                        <TabBtn active={activeTab === 'wishlists'} onClick={() => setActiveTab('wishlists')} icon={<Heart size={14}/>}>Wishlists</TabBtn>
                        {currentUser.role === 'admin' && (
                            <>
                                <TabBtn active={activeTab === 'admin_users'} onClick={() => setActiveTab('admin_users')} icon={<Users size={14}/>}>Artisans</TabBtn>
                                <TabBtn active={activeTab === 'admin_config'} onClick={() => setActiveTab('admin_config')} icon={<TrendingUp size={14}/>}>Policy</TabBtn>
                                <TabBtn active={activeTab === 'admin_logs'} onClick={() => setActiveTab('admin_logs')} icon={<Shield size={14}/>}>Audit</TabBtn>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    {activeTab === 'inventory' && (
                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-stone-200 shadow-sm">
                           <div className="flex items-center gap-2 text-stone-400">
                                <Settings size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Low Stock Alert:</span>
                           </div>
                           <input 
                            type="number" 
                            value={lowStockThreshold} 
                            onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                            className="w-12 text-center font-black text-sm bg-stone-50 border-none outline-none focus:ring-0"
                           />
                        </div>
                    )}
                </div>
            </div>

            {loading ? <div className="py-20 text-center animate-pulse text-stone-400 uppercase font-black tracking-widest text-[10px] print:hidden">Harmonizing Portals...</div> : (
                <div className="animate-in fade-in duration-500 print:hidden">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-10">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
                                <StatCard label="Registry Volume" value={`रु ${stats.revenue.toLocaleString()}`} sub="Gross Market Sales" />
                                <StatCard label="MKS Share" value={`रु ${(stats.revenue - stats.payable).toLocaleString()}`} sub="Revenue Retained" color="text-amber-600" />
                                <StatCard label="Due for Disbursement" value={`रु ${stats.pendingPayout.toLocaleString()}`} sub="Pending Clearance" color="text-blue-600" />
                                <StatCard label="Settled Funds" value={`रु ${stats.paid.toLocaleString()}`} sub="Successfully Payout" color="text-green-600" />
                            </div>
                            <div className="bg-white p-2 sm:p-10 rounded-[1rem] sm:rounded-[3.5rem] border border-stone-100 shadow-sm">
                                <h3 className="font-playfair text-xl font-black mb-10 text-stone-900 border-l-4 border-[#5c1111] pl-6 italic">Market Momentum</h3>
                                <div className="h-72"><canvas ref={salesChartRef}></canvas></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-3 flex-1 w-full md:w-auto">
                                    <div className="relative flex-1 md:max-w-md">
                                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search products..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all text-xs font-medium"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                        <select 
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            className="pl-9 pr-8 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all text-xs font-medium appearance-none"
                                        >
                                            <option value="all">All Categories</option>
                                            {[...new Set(products.map(p => p.category))].filter(Boolean).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleRefresh} 
                                        disabled={refreshing}
                                        className="p-3 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all disabled:opacity-50"
                                    >
                                        <RotateCcw size={16} className={`text-stone-600 ${refreshing ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowAddProductModal(true)}
                                    className="px-6 py-3 bg-[#5c1111] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#2a2723] transition-all"
                                >
                                    <Plus size={16} /> Add New Product
                                </button> 
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {products.length === 0 ? (
                                    <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-stone-200">
                                        <Box size={48} className="mx-auto text-stone-200 mb-6" />
                                        <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">The vault is currently empty.</p>
                                    </div>
                                ) : products.map(p => {
                                const isLow = p.stock <= lowStockThreshold;
                                return (
                                    <div key={p.id} className={`p-1.5 sm:p-4 rounded-3xl border transition-all relative flex items-center gap-4 sm:gap-8 hover:shadow-xl ${isLow ? 'bg-red-50/50 border-red-100' : 'bg-white border-stone-100'}`}>
                                        <img src={p.image} className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm ring-1 ring-stone-100" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1 sm:gap-4">
                                                <h4 className="font-black text-[10px] sm:text-sm text-stone-900">{p.name}</h4>
                                                {isLow && (
                                                    <div className="flex items-center gap-1 sm:px-3 sm:py-0.7 px-1 py-0.5 bg-red-600 text-white rounded-lg text-[5px] sm:text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                        <AlertCircle size={10} /> Critical Reserves
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">{p.category} &bull; रु {p.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-[8px] uppercase font-bold text-stone-300 tracking-widest">Stock Level</p>
                                                <p className={`text-base font-black ${isLow ? 'text-red-600' : 'text-stone-900'}`}>{p.stock}</p>
                                            </div>
                                            <button className="p-3 text-stone-300 hover:text-red-700 transition-colors"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            <div className="flex flex-row md:flex-row items-center gap-2 sm:gap-3 flex-wrap">
                                <div className="relative flex-1 md:max-w-md">
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search orders..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all text-xs font-medium"
                                    />
                                </div>
                                <div className="relative">
                                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <select 
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="pl-9 pr-8 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all text-xs font-medium appearance-none"
                                    >
                                        <option value="all">All Status</option>
                                        {['pending', 'confirmed', 'packing', 'billing', 'arrived', 'delivered', 'cancelled'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={handleRefresh} 
                                    disabled={refreshing}
                                    className="p-3 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all disabled:opacity-50"
                                >
                                    <RotateCcw size={16} className={`text-stone-600 ${refreshing ? 'animate-spin' : ''}`} />
                                </button>
                                {currentUser.role === 'admin' && (
                                    <button 
                                        onClick={() => {
                                            setGroupByCustomer(!groupByCustomer);
                                            setExpandedCustomers({});
                                        }}
                                        className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                                            groupByCustomer 
                                            ? 'bg-[#5c1111] text-white shadow-lg' 
                                            : 'bg-white border border-stone-200 text-stone-500 hover:text-stone-900'
                                        }`}
                                    >
                                        <Users size={14} /> Group by Customer
                                    </button>
                                )}
                            </div>
                            {orders.filter(o =>
                                (filterStatus === 'all' || o.status === filterStatus) &&
                                (searchQuery === '' || o.id?.toString().includes(searchQuery) || o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).length === 0 ? (
                                <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-stone-200">
                                    <ShoppingBag size={48} className="mx-auto text-stone-200 mb-6" />
                                    <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">No order cycles detected.</p>
                                </div>
                            ) : groupByCustomer ? (
                                // Group by Customer View
                                (() => {
                                    const filteredOrders = orders.filter(o => 
                                        (filterStatus === 'all' || o.status === filterStatus) &&
                                        (searchQuery === '' || o.id?.toString().includes(searchQuery) || o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                    );
                                    const groupedOrders = filteredOrders.reduce((acc, order) => {
                                        const customerId = order.customer_id || order.customer?.email || 'unknown';
                                        if (!acc[customerId]) {
                                            acc[customerId] = { customer: order.customer, orders: [], total: 0 };
                                        }
                                        acc[customerId].orders.push(order);
                                        acc[customerId].total += order.total;
                                        return acc;
                                    }, {});
                                    
                                    return Object.entries(groupedOrders).map(([customerId, group]) => (
                                        <div key={customerId} className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm">
                                            <div className="flex flex-col lg:flex-row justify-between items-center gap-8 cursor-pointer hover:border-[#5c1111]/30 transition-all"
                                                onClick={() => setExpandedCustomers(prev => ({...prev, [customerId]: !prev[customerId]}))}>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-[#5c1111] rounded-2xl flex items-center justify-center text-white shadow-inner">
                                                        <Users size={24}/>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-black text-sm text-stone-900">{group.customer?.name || 'Unknown Customer'}</h4>
                                                            <Badge variant="primary">{group.orders.length} Orders</Badge>
                                                        </div>
                                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                                                            {group.customer?.email} &bull; Total: रु {group.total.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-[8px] uppercase text-stone-400 font-bold tracking-widest">Combined Total</p>
                                                        <p className="text-xl font-black text-[#5c1111]">रु {group.total.toLocaleString()}</p>
                                                    </div>
                                                    <ChevronRight size={24} className={`text-stone-400 transition-transform ${expandedCustomers[customerId] ? 'rotate-90' : ''}`}/>
                                                </div>
                                            </div>
                                            
                                            {expandedCustomers[customerId] && (
                                                <div className="mt-6 space-y-4 pl-4 border-l-2 border-[#5c1111]/20">
                                                    <div className="flex justify-end">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCombinedOrders(group.orders);
                                                                setInvoiceOrder(group.orders[0]);
                                                            }}
                                                            className="px-4 py-2 bg-[#5c1111] text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#2a2723] transition-all shadow-md"
                                                        >
                                                            <Printer size={12} /> Print Combined Invoice
                                                        </button>
                                                    </div>
                                                    {group.orders.map(o => (
                                                        <div key={o.id} className="bg-stone-50 p-4 rounded-2xl flex flex-col lg:flex-row justify-between items-center gap-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#5c1111] shadow-inner">
                                                                    <ShoppingBag size={18}/>
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-black text-xs text-stone-900">Registry #{o.id}</h4>
                                                                        <Badge variant={o.status === 'delivered' ? 'primary' : 'dark'}>{o.status}</Badge>
                                                                    </div>
                                                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                                                                        {new Date(o.date).toLocaleDateString()} &bull; {o.items?.length || 0} items
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-4 justify-end">
                                                                <div className="text-right">
                                                                    <p className="text-[8px] uppercase text-stone-400 font-bold tracking-widest">Settlement</p>
                                                                    <p className="text-sm font-black text-[#5c1111]">रु {o.seller_payable_amount.toLocaleString()}</p>
                                                                </div>
                                                                {currentUser.role === 'admin' && (
                                                                    <button disabled={!['packing', 'billing'].includes(o.status)}
                                                                        onClick={(e) => { e.stopPropagation(); setInvoiceOrder(o); }} 
                                                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md ${
                                                                            ['packing', 'billing'].includes(o.status) ? 'bg-[#5c1111] text-white hover:bg-[#2a2723] active:scale-95' : 'bg-stone-100 text-stone-300 cursor-not-allowed opacity-60 shadow-none'}`}
                                                                    >
                                                                        <Printer size={12} /> Invoice
                                                                    </button>
                                                                )}
                                                                <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }} className="p-2 bg-white rounded-xl hover:bg-stone-100 transition-colors" title="View Details">
                                                                    <Eye size={16} className="text-stone-400 hover:text-stone-900" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ));
                                })()
                            ) : orders.map(o => (
                                <div key={o.id} className="bg-white p-2 sm:p-6 sm:rounded-[2rem] rounded-[1rem] border border-stone-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-8 hover:border-[#5c1111]/30 transition-all group">
                                    <div className="flex items-center gap-2 sm:gap-6">
                                        <div className="w-14 h-14 bg-[#efece6] rounded-2xl flex items-center justify-center text-[#5c1111] shadow-inner group-hover:scale-105 transition-transform"><ShoppingBag size={24}/></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-xs sm:text-sm text-stone-900">Registry #{o.id}</h4>
                                                <Badge variant={o.status === 'delivered' ? 'primary' : 'dark'}>{o.status}</Badge>
                                            </div>
                                            <p className="text-[8px] sm:text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">{o.customer.name} &bull; {new Date(o.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-4 justify-start">
                                        <div className="text-center">
                                            <p className="text-[8px] uppercase text-stone-400 font-bold tracking-widest">Update Phase</p>
                                            <select
                                                value={o.status}
                                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                                className="bg-stone-50 text-[10px] font-black uppercase px-4 py-2 rounded-xl border border-stone-100 outline-none focus:ring-2 focus:ring-[#5c1111]/10 transition-all"
                                                disabled={currentUser.role !== 'admin' && ['billing', 'arrived', 'delivered'].includes(o.status)}
                                            >
                                                {currentUser.role === 'admin' 
                                                    ? ['pending', 'confirmed', 'packing', 'billing', 'arrived', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)
                                                    : ['pending', 'confirmed', 'packing'].map(s => <option key={s} value={s}>{s}</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="flex gap-2 items-center">

                                            <button onClick={() => setSelectedOrder(o)} className="flex flex-row items-center gap-2 p-2 sm:p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors" title="View Detail">
                                                <Eye size={18} className="text-stone-400 hover:text-stone-900" />
                                                <p className="text-[8px] sm:text-[10px] uppercase text-stone-400 font-bold tracking-widest">View</p>
                                            </button>

                                            <div className="text-left mr-3">
                                                <p className="text-[8px] uppercase text-stone-400 font-bold tracking-widest">Settlement</p>
                                                <p className="text-sm font-black text-[#5c1111]">रु {o.seller_payable_amount.toLocaleString()}</p>
                                            </div>
                                            
                                            {currentUser.role === 'admin' && (
                                                <button 
                                                    disabled={!['packing', 'billing'].includes(o.status)}
                                                    onClick={() => setInvoiceOrder(o)} 
                                                    className={`px-1 py-2 sm:px-5 sm:py-3 rounded-xl text-[7px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md ${
                                                        ['packing', 'billing'].includes(o.status) 
                                                        ? 'bg-[#5c1111] text-white hover:bg-[#2a2723] active:scale-95' 
                                                        : 'bg-stone-100 text-stone-300 cursor-not-allowed opacity-60 shadow-none'
                                                    }`}
                                                >
                                                    <Printer size={17} /> <span>Print Invoice</span>
                                                </button>
                                            )}
                                            
                                            

                                            {['pending', 'confirmed'].includes(o.status) && (
                                                <button
                                                    onClick={() => handleUpdateStatus(o.id, 'cancelled')}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'wishlists' && (
                        <div className="space-y-6">
                            <div className="flex flex-row items-start gap-3">
                                <div className="relative flex-1 md:max-w-md">
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search wishlisted products..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all text-xs font-medium"
                                    />
                                </div>
                                <button 
                                    onClick={handleRefresh} 
                                    disabled={refreshing}
                                    className="p-3 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all disabled:opacity-50"
                                >
                                    <RotateCcw size={16} className={`text-stone-600 ${refreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="bg-white p-2 sm:p-8 rounded-[1rem] sm:rounded-[2.5rem] border border-stone-100 shadow-sm">
                                <h3 className="font-playfair text-xl font-black mb-6 text-stone-900 border-l-4 border-[#5c1111] pl-6 italic">Product Demand (Wishlists)</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {wishlists.length === 0 ? (
                                        <div className="text-center py-20 bg-stone-50 rounded-[3rem] border border-dashed border-stone-200">
                                            <Heart size={48} className="mx-auto text-stone-200 mb-6" />
                                            <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">No products in wishlist yet.</p>
                                        </div>
                                    ) : (() => {
                                        const demand = wishlists.reduce((acc, w) => {
                                            if (w.product) {
                                                if (!acc[w.product.id]) {
                                                    acc[w.product.id] = { product: w.product, count: 0, customers: [] };
                                                }
                                                acc[w.product.id].count += 1;
                                                if (w.customer && w.customer.name) {
                                                    acc[w.product.id].customers.push(w.customer.name);
                                                }
                                            }
                                            return acc;
                                        }, {});
                                        
                                        const searchFilteredDemand = Object.values(demand).filter(item => 
                                            searchQuery === '' || item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
                                        );

                                        if (searchFilteredDemand.length === 0) {
                                            return (
                                                <div className="text-center py-10">
                                                    <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">No matching products found.</p>
                                                </div>
                                            );
                                        }

                                        return searchFilteredDemand.sort((a, b) => b.count - a.count).map(item => (
                                            <div key={item.product.id} className="p-1 sm:p-6 rounded-[1rem] sm:rounded-[2rem] border border-stone-100 bg-white flex items-center justify-between gap-2 sm:gap-6 hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-2 sm:gap-6">
                                                    <div className="relative">
                                                        <img src={item.product.image} className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white">{item.count}</div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-xs text-stone-900">{item.product.name}</h4>
                                                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">रु {item.product.price.toLocaleString()}</p>
                                                        <p className="text-[9px] text-stone-500 mt-2 truncate max-w-xs" title={item.customers.join(', ')}>
                                                            <span className="font-bold text-stone-700">Interested Collectors:</span> {item.customers.length ? item.customers.join(', ') : 'Anonymous'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[8px] sm:text-[10px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Demand Level</span>
                                                    <Badge  variant={item.count > 5 ? 'primary' : 'saffron'}>{item.count > 5 ? 'High Demand' : 'Trending'}</Badge>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin_users' && currentUser.role === 'admin' && (
                        <div className="space-y-4">
                            {allUsers.filter(u => u.id !== currentUser.id).map(u => (
                                <div key={u.id} className="bg-white p-2 sm:p-8 rounded-[1rem] sm:rounded-[2.5rem] border border-stone-100 flex flex-col md:flex-row justify-between items-center group gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${u.role === 'seller' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <h3 className="font-black text-sm text-stone-900">{u.name}</h3>
                                                <Badge variant={u.role === 'seller' ? 'saffron' : 'dark'}>{u.role}</Badge>
                                            </div>
                                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                                                {u.storeName ? `Studio: ${u.storeName}` : u.email}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-left gap-6">
                                        <div className="text-left">
                                            <p className="text-[8px] uppercase text-stone-400 font-bold tracking-[0.2em] mb-1 text-center">Current Status</p>
                                            <Badge variant={u.status === 'active' ? 'primary' : u.status === 'pending' ? 'saffron' : 'dark'}>{u.status}</Badge>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {u.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleUserStatusUpdate(u.id, 'active')}
                                                    className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    <ShieldCheck size={16} /> Approve
                                                </button>
                                            )}
                                            {u.status === 'active' ? (
                                                <button 
                                                    onClick={() => handleUserStatusUpdate(u.id, 'disabled')}
                                                    className="p-3 bg-stone-100 text-stone-400 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    <UserX size={16} /> Deactivate
                                                </button>
                                            ) : u.status !== 'pending' && (
                                                <button 
                                                    onClick={() => handleUserStatusUpdate(u.id, 'active')}
                                                    className="p-3 bg-stone-900 text-white rounded-xl hover:bg-[#5c1111] transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    <Check size={16} /> Reinstate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'admin_config' && currentUser.role === 'admin' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-white p-2 md:p-12 rounded-[1rem] sm:rounded-[3.5rem] border border-stone-100 shadow-sm">
                                <h3 className="font-playfair text-2xl font-black mb-8 text-stone-900 border-l-4 border-[#5c1111] pl-6 italic">Platform Economic Policy</h3>
                                
                                <div className="max-w-xl">
                                    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 mb-8">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#5c1111] shadow-sm"><TrendingUp size={20}/></div>
                                            <div>
                                                <h4 className="font-black text-sm text-stone-900">Global Commission Rate</h4>
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Applied to all future artisan sales</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-6">
                                            <div className="relative flex-1">
                                                <input 
                                                    type="number" 
                                                    value={globalCommission}
                                                    onChange={(e) => setGlobalCommission(parseFloat(e.target.value) || 0)}
                                                    className="w-full pl-4 pr-12 py-4 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none text-xl font-black transition-all"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-black">%</span>
                                            </div>
                                            <button 
                                                onClick={async () => {
                                                    await dbService.setGlobalCommission(globalCommission, currentUser.id);
                                                    loadData();
                                                    alert("Global commission updated successfully.");
                                                }}
                                                className="px-8 py-4 bg-[#5c1111] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2a2723] transition-all whitespace-nowrap shadow-md"
                                            >
                                                Enact Policy
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100/50">
                                        <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                        <p className="text-xs font-medium text-amber-800 leading-relaxed">
                                            Modifying the global commission rate will only affect orders placed <span className="font-black">after</span> this policy change. Historical orders will retain their respective commission agreements at the time of purchase.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin_logs' && currentUser.role === 'admin' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-playfair text-2xl font-black text-stone-900 border-l-4 border-[#5c1111] pl-6 italic">Governance Audit Trail</h3>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all">
                                    <Download size={14} /> Export Register
                                </button>
                            </div>
                            
                            <div className="bg-white rounded-[1rem] sm:rounded-[3.5rem] border border-stone-100 shadow-sm overflow-hidden">
                                {logs.length === 0 ? (
                                    <div className="text-center py-32 bg-stone-50">
                                        <Shield size={48} className="mx-auto text-stone-200 mb-6" />
                                        <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">The audit register is pristine.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-stone-100">
                                        {[...logs].reverse().map(log => (
                                            <div key={log.id} className="p-4 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-stone-50/50 transition-colors group">
                                                <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[200px]">
                                                    <div className="w-10 h-10 bg-[#efece6] rounded-xl flex items-center justify-center text-[#5c1111] shrink-0">
                                                        <ShieldCheck size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Timestamp</p>
                                                        <p className="text-xs font-bold text-stone-900">{new Date(log.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Directorate Action</p>
                                                    <p className="text-sm font-medium text-stone-700 leading-relaxed group-hover:text-stone-900 transition-colors">
                                                        {log.action}
                                                    </p>
                                                </div>
                                                
                                                <div className="w-full md:w-auto md:min-w-[150px] text-left md:text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Executing Officer</p>
                                                    <Badge variant="dark" className="inline-flex">ID: {log.admin_id.substring(0, 8)}...</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Deep Detail Order Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-1 sm:p-6 bg-[#2a2723]/60 backdrop-blur-md animate-in fade-in duration-300 print:hidden">
                    <div className="bg-[#f8f6f2] w-full max-w-5xl rounded-[1rem] sm:rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative border border-white/20">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-10 right-10 p-4 bg-white/80 rounded-full hover:text-red-800 transition-all active:scale-90 z-10 shadow-sm"><X size={20}/></button>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto no-scrollbar">
                            <div className="lg:col-span-7 p-2 md:p-16 space-y-12">
                                <div className="space-y-6">
                                    <SectionHeading subtitle="Registry Intelligence" title={`Artifact Order #${selectedOrder.id}`} />
                                    <div className="bg-white p-4 sm:p-8 rounded-[1rem] sm:rounded-[2.5rem] border border-stone-100 space-y-2 sm:space-y-4 shadow-inner">
                                        <h5 className="text-[10px] font-black uppercase text-[#5c1111] tracking-[0.2em] flex items-center gap-2">
                                            <MapPin size={12} /> Shipping Coordinates
                                        </h5>
                                        <div className="text-sm font-medium text-stone-600">
                                            <p className="font-black text-stone-900 text-base">{selectedOrder.customer.name}</p>
                                            <p className="mt-2 leading-relaxed italic">
                                                {selectedOrder.customer.address}, {selectedOrder.customer.city}<br/>
                                                Secured Contact: {selectedOrder.customer.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black uppercase text-stone-400 tracking-[0.2em] border-b border-stone-100 pb-3">Collection Manifesto</h5>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map(item => (
                                            <div key={item.id} className="flex gap-6 items-center bg-white p-1.5 sm:p-5 rounded-xl sm:rounded-3xl border border-stone-50 group shadow-sm">
                                                <img src={item.image} className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                                <div className="flex-1">
                                                    <p className="text-xs font-black uppercase tracking-widest text-stone-900">{item.name}</p>
                                                    <p className="text-[10px] text-stone-400 font-bold mt-1">Medium: {item.material} &bull; Qty: {item.quantity}</p>
                                                    <p className="text-sm font-black text-[#5c1111] mt-1">रु {item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-5 p-2 md:p-16 bg-[#efece6]/30 space-y-10 border-l border-white/50">
                                <div className="bg-white p-10 rounded-[1rem] sm:rounded-[3rem] space-y-8 shadow-sm border border-white">
                                    <h5 className="text-[10px] font-black uppercase text-stone-400 border-b border-stone-100 pb-3 tracking-widest text-center">Ledger Split</h5>
                                    <div className="space-y-5">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-stone-400 uppercase tracking-tighter">Gross Principal</span>
                                            <span className="font-black text-stone-900">रु {selectedOrder.total.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-stone-400 uppercase tracking-tighter">MKS Commission</span>
                                            <span className="font-black text-red-700">- रु {selectedOrder.commission_amount.toLocaleString()}</span>
                                        </div>
                                        <div className="pt-6 border-t border-stone-100 flex justify-between items-baseline">
                                            <span className="font-playfair font-black text-stone-400 italic text-sm">Disbursable to Studio</span>
                                            <span className="text-3xl font-black text-[#5c1111]">रु {selectedOrder.seller_payable_amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className={`flex-1 p-5 rounded-2xl border text-center ${selectedOrder.customer_payment_status === 'done' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                            <p className="text-[9px] font-black uppercase mb-1">Collector</p>
                                            <p className="text-[10px] font-black">{selectedOrder.customer_payment_status === 'done' ? 'SETTLED' : 'AWAITING'}</p>
                                        </div>
                                        <div className={`flex-1 p-5 rounded-2xl border text-center ${selectedOrder.mks_payment_status === 'done' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-white border-stone-100 text-stone-400'}`}>
                                            <p className="text-[9px] font-black uppercase mb-1">Disbursement</p>
                                            <p className="text-[10px] font-black">{selectedOrder.mks_payment_status === 'done' ? 'COMPLETED' : 'PENDING'}</p>
                                        </div>
                                    </div>

                                    {currentUser.role === 'admin' && (
                                        <div className="bg-white p-5 rounded-2xl border border-stone-100">
                                            <div className="flex items-center justify-between">
                                                <div className="text-center flex-1">
                                                    <p className="text-[9px] font-black uppercase mb-1">Payment Verification</p>
                                                    <p className={`text-[10px] font-black ${selectedOrder.customer_payment_verified ? 'text-green-700' : 'text-red-700'}`}>
                                                        {selectedOrder.customer_payment_verified ? 'VERIFIED' : 'UNVERIFIED'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleTogglePaymentVerification(selectedOrder.id, !selectedOrder.customer_payment_verified)}
                                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                        selectedOrder.customer_payment_verified
                                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                                >
                                                    {selectedOrder.customer_payment_verified ? 'Unverify' : 'Verify'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {currentUser.role === 'admin' && (
                                        <button 
                                            disabled={!['packing', 'billing', 'delivered'].includes(selectedOrder.status)}
                                            onClick={() => { setInvoiceOrder(selectedOrder); setSelectedOrder(null); }} 
                                            className={`w-full py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
                                                ['packing', 'billing', 'delivered'].includes(selectedOrder.status)
                                                ? 'bg-[#5c1111] text-white hover:bg-stone-900'
                                                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                                            }`}
                                        >
                                            <Printer size={18} /> Official Heritage Bill
                                        </button>
                                    )}
                                    
                                    {currentUser.role === 'admin' && selectedOrder.mks_payment_status === 'pending' && (
                                        <button onClick={() => handleConfirmPayout(selectedOrder.id)} className="w-full bg-stone-900 text-white py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-lg flex items-center justify-center gap-3 hover:bg-[#5c1111] transition-all">
                                            <Wallet size={18} /> Confirm Studio Payout
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {invoiceOrder && (
                <InvoiceView
                    order={invoiceOrder}
                    onClose={() => {
                        setInvoiceOrder(null);
                        setCombinedOrders([]);
                    }}
                    role={currentUser.role}
                    isCombined={combinedOrders.length > 0}
                    combinedOrders={combinedOrders}
                />
            )}

            {/* Add Product Modal */}
            {showAddProductModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-[#2a2723]/60 backdrop-blur-md animate-in fade-in duration-300 print:hidden">
                    <div className="bg-[#f8f6f2] w-full max-w-2xl max-h-[85vh] rounded-[4rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative border border-white/20">
                        <button onClick={() => setShowAddProductModal(false)} className="absolute top-6 right-6 sm:top-10 sm:right-10 p-3 sm:p-4 bg-white/80 rounded-full hover:text-red-800 transition-all active:scale-90 z-10 shadow-sm"><X size={18} className="w-4 h-4 sm:w-5 sm:h-5"/></button>

                        <div className="p-6 sm:p-10 md:p-12 space-y-6 overflow-y-auto max-h-[85vh]">
                            <SectionHeading subtitle="Product Registry" title="Add New Artifact" />

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Product Name</label>
                                        <input
                                            type="text"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                            placeholder="Enter product name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Category</label>
                                        <input
                                            type="text"
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                            placeholder="e.g., Painting, Sculpture"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Description</label>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all h-24 resize-none"
                                        placeholder="Describe your product"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Price (रु)</label>
                                        <input
                                            type="number"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Stock Quantity</label>
                                        <input
                                            type="number"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        value={newProduct.image}
                                        onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Material</label>
                                        <input
                                            type="text"
                                            value={newProduct.material}
                                            onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                            placeholder="e.g., Canvas, Wood"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Dimensions</label>
                                        <input
                                            type="text"
                                            value={newProduct.length}
                                            onChange={(e) => setNewProduct({...newProduct, length: e.target.value})}
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                            placeholder="e.g., 12x16 inches"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Delivery Time</label>
                                        <input
                                            type="text"
                                            value={newProduct.delivery}
                                            onChange={(e) => setNewProduct({...newProduct, delivery: e.target.value})}
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                            placeholder="e.g., 7-10 days"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={newProduct.location}
                                            onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                            placeholder="e.g., Janakpur"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Care Instructions</label>
                                    <input
                                        type="text"
                                        value={newProduct.instruction}
                                        onChange={(e) => setNewProduct({...newProduct, instruction: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                        placeholder="e.g., Keep away from direct sunlight"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Authenticity</label>
                                    <input
                                        type="text"
                                        value={newProduct.authenticity}
                                        onChange={(e) => setNewProduct({...newProduct, authenticity: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#5c1111]/20 focus:border-[#5c1111] outline-none transition-all"
                                        placeholder="e.g., Certified authentic Mithila art"
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        onClick={() => setShowAddProductModal(false)}
                                        className="flex-1 px-6 py-4 bg-stone-100 text-stone-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddProduct}
                                        className="flex-1 px-6 py-4 bg-[#5c1111] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2a2723] transition-all"
                                    >
                                        Add Product
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
