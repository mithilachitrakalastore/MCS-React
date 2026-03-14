import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Plus, Heart, Eye, Share2, Check } from 'lucide-react';
import { Badge } from './Badge';
import { QuickViewModal } from './QuickViewModal';

export const ProductCard = ({ product, addToCart, isWishlisted, toggleWishlist }) => {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);

    const triggerFeedback = () => {
        setIsAnimating(false);
        // Force reflow
        void (null); 
        setTimeout(() => setIsAnimating(true), 10);
        setTimeout(() => setIsAnimating(false), 510);
    };

    const handleAddToCart = () => {
        addToCart(product);
        setIsAdded(true);
        triggerFeedback();
    };

    useEffect(() => {
        if (isAdded) {
            const timer = setTimeout(() => setIsAdded(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isAdded]);

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        toggleWishlist?.(product.id);
        triggerFeedback();
    };

    const handleShare = async (e) => {
        e.preventDefault();
        const shareData = {
            title: `MKS - ${product.name}`,
            text: product.description,
            url: `${window.location.origin}/#/product/${product.slug}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err); 
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                setShowCopiedFeedback(true);
                setTimeout(() => setShowCopiedFeedback(false), 2000);
            } catch (err) {
                alert('Could not copy link to clipboard');
            }
        }
    };

    return (
        <>
            <div className="group bg-[#f8f6f2] rounded-[0.9rem] sm:rounded-3xl overflow-hidden border border-[#e5e1d8] mithila-card-shadow transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#5c1111]/10 flex flex-col h-full">
                <div className="relative aspect-square overflow-hidden bg-[#efece6]">
                    <Link to={`/product/${product.slug}`} className="block h-full">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 opacity-95 group-hover:opacity-100" 
                        />
                    </Link>
                    
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
                        {product.badge && <Badge variant={product.badge === 'Bestseller' ? 'saffron' : 'primary'}>{product.badge}</Badge>}
                    </div>

                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex flex-col gap-1 sm:gap-2">
                        <button 
                            onClick={handleToggleWishlist}
                            className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 ${isWishlisted ? 'bg-[#5c1111] text-white' : 'bg-white/90 text-stone-400 hover:text-[#5c1111]'}`}
                            title="Add to Wishlist"
                        >
                            <Heart size={12} className="sm:w-[14px] sm:h-[14px]" fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); setIsQuickViewOpen(true); }}
                            className="p-1.5 sm:p-2 bg-white/90 text-stone-400 hover:text-[#2a2723] rounded-full transition-all duration-300 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 delay-75 hidden sm:flex"
                            title="Quick View"
                        >
                            <Eye size={14} />
                        </button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 z-20 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-6 sm:group-hover:translate-y-0 transition-all duration-500 ease-out">
                        <button 
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`w-full py-2 sm:py-3 rounded-lg sm:rounded-xl text-[7px] sm:text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300 
                                ${isAdded ? 'bg-green-600 text-white' : 'bg-[#2a2723] text-white hover:bg-[#5c1111] sm:hover:scale-[1.02]'} 
                                ${isAnimating ? 'animate-feedback-bounce' : ''} 
                                active:scale-95`}
                        >
                            {isAdded ? (
                                <>
                                    <Check size={10} className="sm:w-[12px]" /> <span className="hidden xs:inline">Added</span><span className="xs:hidden">✓</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={10} className="sm:w-[12px]" /> <span className="hidden xs:inline">Add To Bag</span><span className="xs:hidden">Add</span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a2723]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>

                <div className="p-3 sm:p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1 gap-2">
                        <Link to={`/product/${product.slug}`} className="hover:text-[#5c1111] transition-colors flex-1">
                            <h3 className="font-playfair text-sm sm:text-lg font-black text-[#2a2723] leading-tight line-clamp-1">{product.name}</h3>
                        </Link>
                        <div className="flex items-center gap-0.5 sm:gap-1 text-amber-600 mt-0.5 shrink-0">
                            <Star size={8} className="sm:w-[10px]" fill="currentColor" />
                            <span className="text-[8px] sm:text-[9px] font-black">{product.rating}</span>
                        </div>
                    </div>
                    <p className="text-[7px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2 sm:mb-3 line-clamp-1">{product.storeName}</p>
                    <div className="flex items-center justify-between border-t border-[#e5e1d8] pt-2 sm:pt-3 mt-auto">
                        <span className="text-[#5c1111] font-playfair font-black text-sm sm:text-xl">रु {product.price.toLocaleString()}</span>
                        <Link 
                            to={`/product/${product.slug}`} 
                            className="hidden xs:flex items-center gap-1 text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-[#2a2723] transition-colors group/link"
                        >
                            Details <ArrowRight size={10} className="sm:w-[12px] transition-transform group-hover/link:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

            <QuickViewModal 
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                addToCart={addToCart}
            />
        </>
    );
};
