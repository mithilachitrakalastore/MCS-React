import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Shield, Store } from 'lucide-react';

export const Navbar = ({ cartCount, currentUser, setCurrentUser }) => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate(); 

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logout = () => {
        setCurrentUser(null);
        navigate('/');
    };

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 print:hidden ${scrolled ? 'glass-nav py-2 sm:py-3 shadow-md' : 'bg-transparent py-4 sm:py-6'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[0.5rem] flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg transition-all group-hover:rotate-6 group-hover:scale-105">
                        <img 
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-[0.5rem]"
                          src="https://res.cloudinary.com/djmbuuz28/image/upload/v1761108817/logo.png" 
                          alt="Logo" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-dancing text-xl sm:text-2xl font-bold text-[#2a2723] tracking-tight leading-none">Mithila</span>
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#5c1111]/70 leading-none mt-1">Chitrakala</span>
                    </div>
                </Link>

                <div className="hidden lg:flex gap-10 items-center">
                    <Link to="/"><span className="text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#5c1111] text-stone-500">Home</span></Link>
                    <Link to="/products" className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#5c1111] ${location.pathname === '/products' ? 'text-[#5c1111] border-b-2 border-[#5c1111] pb-1' : 'text-stone-500'}`}>Gallery</Link>
                    <Link to="/advice" className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#5c1111] ${location.pathname === '/advice' ? 'text-[#5c1111] border-b-2 border-[#5c1111] pb-1' : 'text-stone-500'}`}>AI Art Consultant</Link>
                    {currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin') && (
                        <Link to="/seller" className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#5c1111] flex items-center gap-2 ${location.pathname === '/seller' ? 'text-[#5c1111] border-b-2 border-[#5c1111] pb-1' : 'text-stone-500'}`}>
                            {currentUser.role === 'admin' ? <Shield size={14} /> : <Store size={14} />}
                            {currentUser.role === 'admin' ? 'Administration' : 'Artisan Portal'}
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    {currentUser ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                             <Link to="/profile" className="p-2 sm:p-3 text-stone-600 hover:text-[#5c1111] transition-colors relative group">
                                <UserIcon size={20} />
                                <span className="absolute top-1 sm:top-2 right-1 sm:right-2 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                            </Link>
                            <button onClick={logout} className="hidden lg:flex p-3 text-stone-400 hover:text-red-700 transition-colors"><LogOut size={18}/></button>
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-2 sm:px-6 sm:py-3 bg-[#f4f1ec] border border-stone-200 text-[#5c1111] rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Sign In</Link>
                    )}
                    
                    <Link to="/cart" className="relative p-2 sm:p-3 bg-[#5c1111] text-white rounded-2xl hover:bg-[#2a2723] transition-all shadow-xl premium-shadow group">
                        <ShoppingCart size={18} className="transition-transform group-hover:-rotate-12" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-[#5c1111] animate-in zoom-in duration-300">{cartCount}</span>}
                    </Link>
                </div>
            </div>
        </nav>
    );
};
