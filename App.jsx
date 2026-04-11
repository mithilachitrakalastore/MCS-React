import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { dbService } from './services/dbservices';

// 1. New Scroll Management Component
const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) {
            // If no #hash, jump to top of page
            window.scrollTo(0, 0);
        } else {
            // If there is a #hash, find the element and scroll smoothly
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [pathname, hash]); // Trigger on route or hash change

    return null; 
};

// Components
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { ArtAdvicePage } from './pages/ArtAdvicePage';
import { ProfilePage } from './pages/ProfilePage';
import { WishlistPage } from './pages/WishlistPage';
import { SellerPanel } from './pages/SellerPanel';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicy } from "./pages/PrivacyPolicy";


const Preloader = () => (
    <div className="fixed inset-0 z-[2000] bg-[#efece6] flex flex-col items-center justify-center animate-in fade-in duration-700">
        <div className="relative">
            {/* Animated Ring */}
            <div className="absolute inset-0 -m-4 border-2 border-[#5c1111]/10 rounded-[2.5rem] animate-ping duration-[3000ms]"></div>
            
            {/* Logo Box */}
            <div className="w-20 h-20 flex rounded-[0.5rem] items-center justify-center text-white font-black text-4xl shadow-2xl relative z-10 animate-bounce">
                <img
                   className="w-20 h-20 rounded-[0.5rem] object-contain"
                   src="https://res.cloudinary.com/djmbuuz28/image/upload/v1761108817/logo.png" 
                   alt="" 
                   />
            </div>
        </div>

        <div className="mt-12 text-center space-y-4">
            <div className="flex flex-col items-center">
                <span className="font-dancing text-4xl font-bold text-[#2a2723] tracking-tight animate-pulse">Mithila</span>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#5c1111]/70 mt-1">Chitrakala</span>
            </div>
            
            <div className="pt-8 flex flex-col items-center gap-3">
                <div className="w-48 h-[1px] bg-stone-200 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-[#5c1111] w-1/2 animate-[loading-bar_2s_infinite_ease-in-out]"></div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 animate-pulse">Harmonizing Heritage Portals...</p>
            </div>
        </div>

        <style>{`
            @keyframes loading-bar {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
            }
        `}</style>
    </div>
);

// Load cart and wishlist from localStorage immediately when the module loads
const loadCartFromStorage = () => {
    try {
        const saved = localStorage.getItem('mithila-cart');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
};

// Removed loadWishlistFromStorage

const loadUserFromStorage = () => {
    try {
        const saved = localStorage.getItem('mithila-user');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
};

// Initialize state with data from localStorage immediately
const initialCart = loadCartFromStorage();
const initialWishlist = [];
const initialUser = loadUserFromStorage();

export default function App() {
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(initialCart);
    const [wishlist, setWishlist] = useState(initialWishlist);
    const [currentUser, setCurrentUser] = useState(initialUser);
    
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Minimum preloader time for aesthetic impact
                const minLoaderPromise = new Promise(resolve => setTimeout(resolve, 2200));
                const dataPromise = dbService.getProducts();
                
                const [data] = await Promise.all([dataPromise, minLoaderPromise]);
                setProducts(data);

                if (currentUser) {
                    const wishlistsData = await dbService.getWishlists();
                    const userWishlists = wishlistsData.filter(w => w.userId === currentUser.id).map(w => w.productId);
                    if (userWishlists.length > 0) {
                        // Merge local wishlist with DB ones, preferring DB
                        const merged = Array.from(new Set([...wishlist, ...userWishlists]));
                        setWishlist(merged);
                        
                        // Push any local only ones to DB
                        const localOnly = wishlist.filter(id => !userWishlists.includes(id));
                        for (let id of localOnly) {
                             await dbService.addToWishlist(currentUser.id, id).catch(() => {});
                        }
                    }
                } else {
                    setWishlist([]); // Clear wishlist on logout or for guests on load
                }
            } catch (error) {
                console.error("Failed to harmonize portals:", error);
            } finally {
                setIsAppLoading(false);
            }
        };
        loadInitialData();
    }, [currentUser]);

    useEffect(() => { localStorage.setItem('mithila-cart', JSON.stringify(cart)); }, [cart]);
    // Wishlist no longer stored in localStorage
    useEffect(() => { if (currentUser) localStorage.setItem('mithila-user', JSON.stringify(currentUser)); else localStorage.removeItem('mithila-user'); }, [currentUser]);

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(i => i.id === product.id);
            if (exists) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const toggleWishlist = async (id) => {
        const isAdding = !wishlist.includes(id);
        
        // Optimistic UI update
        setWishlist(prev => isAdding ? [...prev, id] : prev.filter(i => i !== id));

        // Sync with backend if user is logged in
        if (currentUser) {
            try {
                if (isAdding) {
                    await dbService.addToWishlist(currentUser.id, id);
                } else {
                    await dbService.removeFromWishlist(currentUser.id, id);
                }
            } catch (error) {
                console.error("Failed to sync wishlist with server:", error);
            }
        }
    };
    const updateQty = (id, q) => {
        if (q <= 0) { setCart(prev => prev.filter(i => i.id !== id)); return; }
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: q } : i));
    };

    const remove = (id) => setCart(prev => prev.filter(i => i.id !== id));
    const clearCart = () => setCart([]);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    if (isAppLoading) return <Preloader />;

    return (
        <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col selection:bg-[#5c1111] selection:text-white animate-in fade-in zoom-in-95 duration-1000">
                <Navbar cartCount={cartCount} currentUser={currentUser} setCurrentUser={setCurrentUser} />
                <main className="flex-grow pb-20 lg:pb-0">
                    <Routes>
                        <Route path="/" element={<HomePage products={products} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
                        <Route path="/products" element={<ProductsPage products={products} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
                        <Route path="/product/:slug" element={<ProductDetailPage products={products} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
                        <Route path="/cart" element={currentUser ? <CartPage cart={cart} updateQty={updateQty} remove={remove} clearCart={clearCart} currentUser={currentUser} /> : <Navigate to="/login" />} />
                        <Route path="/advice" element={<ArtAdvicePage />} />
                        <Route path="/login" element={currentUser ? <Navigate to="/profile" /> : <LoginPage onLogin={setCurrentUser} />} />
                        <Route path="/profile" element={currentUser ? <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} wishlist={wishlist} products={products} toggleWishlist={toggleWishlist} addToCart={addToCart} /> : <Navigate to="/login" />} />
                        <Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />} />
                        <Route 
                            path="/seller" 
                            element={
                                (currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin')) ? 
                                <SellerPanel currentUser={currentUser} /> : 
                                <Navigate to="/login" />
                            } 
                        />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    </Routes>
                </main>
                <BottomNav currentUser={currentUser} />
                <Footer />
            </div>
        </Router>
    );
}
