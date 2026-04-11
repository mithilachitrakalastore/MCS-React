import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Sparkles, User, Briefcase } from 'lucide-react';

export const BottomNav = ({ currentUser }) => {
    const location = useLocation();
    
    const navItems = [ 
        { icon: Home, label: 'Home', path: '/' },
        { icon: Grid, label: 'Gallery', path: '/products' },
        { icon: Sparkles, label: 'Oracle', path: '/advice' },
    ];

    if (currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin')) {
        navItems.push({ icon: Briefcase, label: 'Portal', path: '/seller' });
    } else {
        navItems.push({ icon: User, label: 'Profile', path: currentUser ? '/profile' : '/login' });
    }

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[110] bg-[#efece6]/95 backdrop-blur-lg border-t border-[#d1cdc7] px-6 py-3 pb-6 flex justify-between items-center shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] print:hidden">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link 
                        key={item.path} 
                        to={item.path} 
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#5c1111] scale-110' : 'text-stone-400'}`}
                    >
                        <item.icon size={20} className={isActive ? 'fill-[#5c1111]/10' : ''} />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                        {isActive && <div className="w-1 h-1 bg-[#5c1111] rounded-full mt-0.5"></div>}
                    </Link>
                );
            })}
        </div>
    );
};
