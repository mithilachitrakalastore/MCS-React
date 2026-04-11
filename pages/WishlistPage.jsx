import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage = ({ products, wishlist, toggleWishlist, addToCart }) => {
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="pt-40 pb-32 px-6 max-w-7xl mx-auto min-h-screen">
            <SectionHeading 
                subtitle="Your Curated Collection" 
                title="My Wishlist" 
                centered 
            />
 
            {wishlistProducts.length === 0 ? (
                <div className="text-center py-20 animate-in fade-in duration-500">
                    <div className="w-32 h-32 mx-auto mb-8 bg-[#efece6] rounded-full flex items-center justify-center">
                        <Heart size={48} className="text-stone-300" />
                    </div>
                    <h3 className="font-playfair text-3xl font-black text-stone-900 mb-4">Your Wishlist is Empty</h3>
                    <p className="text-stone-400 font-light max-w-md mx-auto mb-10">
                        Start adding artworks you love to your wishlist. They'll appear here for easy access.
                    </p>
                    <Link 
                        to="/products" 
                        className="inline-flex items-center gap-3 bg-[#5c1111] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#2a2723] transition-all"
                    >
                        Explore Gallery <ArrowRight size={16} />
                    </Link>
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'artwork' : 'artworks'} saved
                        </p>
                        <Link 
                            to="/products" 
                            className="text-[#5c1111] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                        >
                            Continue Exploring <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
                </div>
            )}
        </div>
    );
};
