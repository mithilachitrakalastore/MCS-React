import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { ProductCard } from '../components/ProductCard';

export const ProductsPage = ({ products, addToCart, wishlist, toggleWishlist }) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'all' || p.category === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="pt-24 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-11 mb-10 sm:mb-20">
                <div className="w-full">
                    <SectionHeading subtitle="Artisan Originals" title="The Heritage Vault" /> 
                </div>
                
                <div className="w-full lg:w-auto flex flex-col gap-4">
                    <div className="relative w-full lg:min-w-[400px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search motifs..." 
                            className="w-full pl-14 pr-6 py-4 bg-[#e5e1d8]/50 border border-[#d1cdc7] rounded-[1.5rem] sm:rounded-[2rem] text-sm focus:ring-4 focus:ring-[#5c1111]/5 focus:border-[#5c1111] focus:bg-[#f8f6f2] transition-all shadow-sm outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#5c1111]"><X size={16} /></button>}
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar sm:mx-0 sm:px-0">
                        {['all', 'paintings', 'accessories', 'home-decor'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-5 py-3 sm:px-8 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${category === cat ? 'bg-[#5c1111] text-white border-[#5c1111] shadow-xl premium-shadow' : 'bg-[#f8f6f2] text-stone-500 border-[#d1cdc7] hover:bg-[#efece6]'}`}
                            >
                                {cat.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-4">
                    {filtered.map(p => (
                        <ProductCard 
                            key={p.id} 
                            product={p} 
                            addToCart={addToCart} 
                            isWishlisted={wishlist.includes(p.id)} 
                            toggleWishlist={toggleWishlist} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 sm:py-48 bg-[#f8f6f2] rounded-[2rem] sm:rounded-[4rem] border border-dashed border-[#d1cdc7] px-6">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[#efece6] rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 text-stone-300 shadow-inner">
                        <Filter size={32} />
                    </div>
                    <h3 className="font-playfair text-2xl sm:text-4xl font-black text-[#2a2723] mb-3">Silent Corridors</h3>
                    <p className="text-stone-400 font-light max-w-xs mx-auto text-sm sm:text-base">These specific motifs are currently only whispered in the artist's studio.</p>
                    <button onClick={() => { setSearch(''); setCategory('all'); }} className="mt-8 text-[#5c1111] font-black text-[10px] uppercase tracking-widest hover:underline underline-offset-8">Clear filters</button>
                </div>
            )}
        </div>
    );
}
