import React from 'react';

export const Badge = ({ children, variant = 'primary' }) => {
    const styles = {
        primary: 'bg-red-800 text-white',
        saffron: 'bg-amber-400 text-amber-950', 
        cancelled: 'bg-red-100 text-red-800'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${styles[variant]}`}>
            {children}
        </span>
    );
};
