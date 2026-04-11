import React from 'react';

export const SectionHeading = ({ subtitle, title, centered = false }) => (
    <div className={`mb-6 sm:mb-10 ${centered ? 'text-center' : 'text-left'}`}>
        <span className="text-red-800 font-extrabold uppercase tracking-[0.3em] text-[9px] sm:text-[10px] mb-2 sm:mb-3 block">{subtitle}</span>
        <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 leading-tight">{title}</h2>
        <div className={`mt-3 sm:mt-4 h-1 w-16 bg-amber-400 ${centered ? 'mx-auto' : ''}`}></div>
    </div>
); 
