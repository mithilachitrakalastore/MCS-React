import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Plus, ShieldCheck, Globe } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { ProductCard } from '../components/ProductCard';

export const HomePage = ({ products, addToCart, wishlist, toggleWishlist }) => {
    return (
        <div className=" overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center px-1 sm:px-6 pt-24 sm:pt-32">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-[10%] left-[5%] w-32 h-32 sm:w-64 sm:h-64 bg-[#5c1111]/5 rounded-full blur-[60px] sm:blur-[100px]"></div>
                    <div className="absolute bottom-[20%] right-[10%] w-48 h-48 sm:w-96 sm:h-96 bg-amber-600/5 rounded-full blur-[80px] sm:blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                    <div className="space-y-2 sm:space-y-10 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 bg-[#e5e1d8]/40 border border-[#d1cdc7] text-[#5c1111] rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] premium-shadow">
                            <Sparkles size={12} className="text-amber-600 sm:w-[14px]" /> Since 2500 BC
                        </div>
                        
                        <div className="space-y-4 sm:space-y-6">
                            <h1 className="font-playfair text-3xl md:text-7xl lg:text-8xl font-black text-[#2a2723] leading-[1.1] sm:leading-[0.95] tracking-tight">
                                Sacred <br/>
                                <span className="italic text-[#5c1111] font-dancing font-bold">Brushstrokes</span>
                            </h1>
                            <p className="text-[13px] sm:text-lg text-stone-500 max-w-lg leading-relaxed font-light mx-auto lg:mx-0 px-4 sm:px-0">
                                Discover authentic Mithila art, where every stroke carries a prayer and every dye is born from the earth.
                            </p>
                        </div>

                        <div className="flex flex-row gap-4 sm:gap-8 justify-center pt-2 px-1 sm:px-4 sm:px-0">
                            <Link to="/products" className="bg-[#5c1111] text-white px-5 sm:px-6 py-4 sm:px-10 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] shadow-2xl hover:bg-[#2a2723] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 sm:gap-4" title='Explore More Paintings'>
                                Enter Gallery <ArrowRight size={16} />
                           </Link>
                            <Link to="/advice" className="bg-[#f8f6f2] text-[#2a2723] px-3 sm:px-6 py-4 sm:px-10 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] border border-[#d1cdc7] hover:bg-[#efece6] transition-all flex items-center justify-center gap-3 sm:gap-4" title='Ask With AI'>
                                AI Oracle <Sparkles size={16} className="text-amber-600" />
                            </Link>
                        </div>

                        <div className="hidden sm:flex items-center justify-center lg:justify-start gap-8 opacity-40 pt-6 grayscale contrast-50">
                            <div className="flex items-center gap-2"><Globe size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Global Shipping</span></div>
                            <div className="flex items-center gap-2"><ShieldCheck size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Certified Origin</span></div>
                        </div>
                    </div>
                    
                    <div className="relative group max-w-sm sm:max-w-xl mx-auto lg:ml-auto px-4 sm:px-0">
                        <div className="relative bg-[#f8f6f2] p-2 sm:p-4 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-[#e5e1d8] animate-subtle-float overflow-hidden">
                            <img src="https://res.cloudinary.com/djmbuuz28/image/upload/v1774971793/Shri_Krishna_Leela_-_The_Circular_Chronicles.png" className="w-full aspect-rectangle object-cover rounded-[1.8rem] sm:rounded-[2.5rem] opacity-100 saturate-[0.4] group-hover:saturate-150  group-hover:scale-105 transition-all duration-1000" alt="Shri Krishna Leela - The Circular Chronicles" />
                           
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2a2723]/30 to-transparent pointer-events-none"></div>
                            
                            <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 bg-[#efece6]/95 backdrop-blur-md p-2 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl transform transition-transform group-hover:translate-y-1 border border-white/20">
                                <p className="font-playfair font-black text-[#2a2723] text-xm sm:text-xl leading-tight mb-1 italic">Shri Krishna Leela - The Circular Chronicles</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#5c1111]">Artisan Exclusive</p>
                                    <span className="text-[#2a2723] text-xs sm:text-sm font-bold">रु 18,500</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-10 mb-10 sm:mb-16">
                    <SectionHeading subtitle="Curated Heritage" title="Private Collection" />
                    <Link to="/products" className="sm:mb-12 text-stone-400 hover:text-[#5c1111] font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 transition-colors">
                        Full Gallery <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#d1cdc7] flex items-center justify-center transition-all group-hover:bg-[#5c1111] group-hover:text-white group-hover:border-[#5c1111]"><Plus size={14} /></div>
                    </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-8 lg:gap-10">
                    {products.filter(p => p.featured).slice(0, 3).map(p => (
                        <ProductCard 
                            key={p.id} 
                            product={p} 
                            addToCart={addToCart} 
                            isWishlisted={wishlist.includes(p.id)} 
                            toggleWishlist={toggleWishlist} 
                        />
                    ))}
                </div>

                <Link to="/products" className="block text-center mt-10 sm:mt-16 text-stone-400 hover:text-[#5c1111] font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] transition-colors">
                   <button className="bg-[#5c1111] text-white px-6 py-4 rounded-full hover:bg-[#3a0a0a] transition-colors">View Full Collection</button>
                </Link>
            </section>

            {/* Heritage Section */}
            <section className="bg-[#1e1c1a] py-20 sm:py-32 px-4 sm:px-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-[#5c1111]/5 blur-[150px] rounded-full"></div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-20 items-center">
                    <div className="space-y-6 sm:space-y-10">
                        <div className="space-y-2 sm:space-y-4">
                            <span className="text-amber-600 font-black uppercase tracking-[0.4em] text-[9px] sm:text-[10px]">Living Tradition</span>
                            <h2 className="font-playfair text-3xl sm:text-6xl font-black text-[#efece6] leading-tight">Souls of Janakpur</h2>
                        </div>
                        <p className="text-stone-400 text-sm sm:text-lg font-light leading-relaxed">
                            Mithila art is not merely painting; it is a ritual of life. For millennia, artisans have transformed humble mud walls into divine tapestries using nature's own palette.
                        </p>
                        <div className="grid grid-cols-2 gap-6 sm:gap-12 border-t border-white/5 pt-6 sm:pt-10">
                            <div className="space-y-1 sm:space-y-2">
                                <h4 className="text-amber-600 font-playfair text-3xl sm:text-4xl font-black italic">100%</h4>
                                <p className="text-stone-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em]">Earth Pigments</p>
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <h4 className="text-amber-600 font-playfair text-3xl sm:text-4xl font-black italic">2,500+</h4>
                                <p className="text-stone-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em]">Year Heritage</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative group max-w-xs sm:max-w-lg mx-auto lg:ml-auto">
                        <div className="aspect-square rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-[6px] sm:border-[10px] border-white/5 shadow-2xl bg-[#efece6]">
                            <img src="https://res.cloudinary.com/djmbuuz28/image/upload/v1774970560/The%20Lady%20From%20Mithila.jpg" className="w-full h-full object-cover grayscale opacity-80 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110" alt="The Lady From Mithila" title='The Lady From Mithila' />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
