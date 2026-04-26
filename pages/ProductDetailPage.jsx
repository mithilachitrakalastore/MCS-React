import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Star, Store, MapPin, Minus, Plus, ShoppingCart, Truck, ShieldCheck, RefreshCw, ArrowLeft, Heart, ChevronLeft, ChevronRight, MessageSquare, Send } from 'lucide-react';
import { Badge } from '../components/Badge';
import { ProductCard } from '../components/ProductCard';
import { SectionHeading } from '../components/SectionHeading';
import { dbService } from '../services/dbservices';

export const ProductDetailPage = ({ products, addToCart, wishlist, toggleWishlist }) => {
    const { slug } = useLocation().pathname.split('/').slice(-1)[0] ? { slug: useLocation().pathname.split('/').slice(-1)[0] } : { slug: '' };
    const product = products.find(p => p.slug === slug);
    const [activeImg, setActiveImg] = useState(product?.image);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const navigate = useNavigate();
    const carouselRef = useRef(null); 

    const currentUser = JSON.parse(localStorage.getItem('mithila-user') || 'null');
    const isWishlisted = product ? wishlist.includes(product.id) : false;

    useEffect(() => {
        if (product) {
            setActiveImg(product.image);
            setQuantity(1);
            window.scrollTo(0, 0);
            loadReviews();
        }
    }, [product]);

    const loadReviews = async () => {
        if (product) {
            const data = await dbService.getReviews(product.id);
            setReviews(data);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser || !product) return;
        setIsSubmittingReview(true);
        await dbService.addReview({
            productId: product.id,
            userId: currentUser.id,
            userName: currentUser.name,
            rating: newReview.rating,
            comment: newReview.comment
        });
        setNewReview({ rating: 5, comment: '' });
        setIsSubmittingReview(false);
        loadReviews();
    };

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const { scrollLeft, clientWidth } = carouselRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return products
            .filter(p => p.category === product.category && p.id !== product.id)
            .concat(products.filter(p => p.category !== product.category && p.id !== product.id).slice(0, 4));
    }, [product, products]);

    if (!product) return (
        <div className="pt-40 h-screen flex items-center justify-center text-center">
            <div className="space-y-4">
                <h1 className="text-4xl font-playfair font-black">Piece not found</h1>
                <Link to="/products" className="text-red-800 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Gallery
                </Link>
            </div>
        </div>
    );

    const images = [product.image, ...(product.images || [])];

    return (
        <div className="pt-40 pb-32 px-6 max-w-7xl mx-auto min-h-screen selection:bg-[#5c1111] selection:text-white">
            <div className="mb-10">
                <button onClick={() => navigate(-1)} className="text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                    <ArrowLeft size={14} /> Go Back
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-start">
                <div className="lg:col-span-5 space-y-6 flex flex-col">
                    <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-xl border-[8px] border-white ring-1 ring-stone-100">
                        <img src={activeImg} className="w-full h-full object-cover transition-all duration-700" alt={product.name} />
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                        {images.map((img, i) => (
                            <button 
                                key={i} 
                                onClick={() => setActiveImg(img)}
                                className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImg === img ? 'border-[#5c1111] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge variant="saffron">{product.badge || 'Featured'}</Badge>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                                <Star size={14} fill="currentColor" /> {product.rating} &bull; {reviews.length} Reviews
                            </div>
                        </div>
                        <h1 className="font-playfair text-2xl sm:text-5xl lg:text-5xl font-black text-stone-900 leading-tight tracking-tight">{product.name}</h1>
                        <p className="text-stone-400 font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                            <Store size={20} className="text-[#5c1111]" /> {product.storeName}</p>
                        <p className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                            <MapPin size={20} className="text-[#5c1111]" /> Artisan Studio in {product.location}
                        </p>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className="text-[#5c1111] font-playfair font-black text-2xl sm:text-5xl lg:text-4xl tracking-tighter">रु {product.price.toLocaleString()}</span>
                    </div>

                    <p className="text-stone-500 text-sm sm:text-xm lg:text-[1rem] p-3 sm:p-3 lg:p-4 leading-relaxed font-light italic bg-[#f8f6f2] rounded-[0.8rem] border-l-4 border-[#5c1111]">
                        "{product.description}"
                    </p>

                    <div className="grid grid-cols-2 gap-6 bg-white p-3 rounded-[0.8rem] border border-stone-100 shadow-sm">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Medium & Palette</p>
                            <p className="text-stone-800 font-bold text-sm">{product.material}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Canvas Scale</p>
                            <p className="text-stone-800 font-bold text-sm">{product.length}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg gap-4 pt-4">
                        <p className='text-stone-800 text-sm sm:hidden font-bold'>Quantity</p>
                        <div className="flex items-center justify-between bg-stone-100 rounded-2xl p-1 px-3 h-16 shadow-inner border border-stone-200">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-stone-500 hover:text-[#5c1111]"><Minus size={18} /></button>
                            <span className="w-12 text-center font-black text-lg text-stone-900">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-stone-500 hover:text-[#5c1111]"><Plus size={18} /></button>
                        </div>
                        <div className="flex gap-2 flex-1">
                            <button 
                                onClick={() => {
                                    for(let i=0; i<quantity; i++) addToCart(product);
                                }}
                                className="flex-1 bg-[#5c1111] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-stone-900 transition-all shadow-2xl shadow-red-900/20 flex items-center justify-center gap-3 active:scale-95"
                            >
                                <ShoppingCart size={22} /> Add To Cart
                            </button>
                            <button 
                                onClick={() => toggleWishlist(product.id)}
                                className={`w-16 flex items-center justify-center rounded-2xl border transition-all ${isWishlisted ? 'bg-[#5c1111] border-[#5c1111] text-white' : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-50'}`}
                            >
                                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-stone-100 grid grid-cols-3 gap-6">
                        <div className="text-center space-y-2 group">
                            <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center mx-auto text-stone-300 group-hover:text-[#5c1111] transition-colors border border-stone-100"><Truck size={20} /></div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">Logistics</p>
                        </div>
                        <div className="text-center space-y-2 group">
                            <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center mx-auto text-stone-300 group-hover:text-[#5c1111] transition-colors border border-stone-100"><ShieldCheck size={20} /></div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">Certified</p>
                        </div>
                        <div className="text-center space-y-2 group">
                            <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center mx-auto text-stone-300 group-hover:text-[#5c1111] transition-colors border border-stone-100"><RefreshCw size={20} /></div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">Ethical</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carousel Section */}
            <div className="pt-18 pb-12">
                <div className="flex justify-between items-end mb-10">
                    <SectionHeading 
                        subtitle="Curated Recommendations" 
                        title="Artisan's Choice" 
                    />
                    <div className="flex gap-2 mb-10">
                        <button onClick={() => scrollCarousel('left')} className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center active:bg-[#5c1111] bg-stone-800 active:text-white cursor-pointer transition-all text-stone-400">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => scrollCarousel('right')} className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center active:bg-[#5c1111] bg-stone-800 active:text-white cursor-pointer transition-all text-stone-400">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                
                <div 
                    ref={carouselRef}
                    className="flex gap-3 overflow-x-auto no-scrollbar pb-10 -mx-4 px-4 snap-x"
                >
                    {relatedProducts.map(related => (
                        <div key={related.id} className="min-w-[180px] md:min-w-[350px] snap-start">
                            <ProductCard 
                                product={related} 
                                addToCart={addToCart}
                                isWishlisted={wishlist.includes(related.id)}
                                toggleWishlist={toggleWishlist}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="pt-24 border-t border-stone-100 grid grid-cols-1 lg:grid-cols-12 gap-20">
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-[#5c1111] text-white p-6 rounded-[1.2rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                        <h3 className="font-playfair text-2xl sm:text3xl lg:text-3xl font-black mb-4">Artisan's Impact</h3>
                        <p className="text-white/70 text-sm leading-relaxed mb-10">Every review helps sustain a village economy and preserves thousands of years of Mithila oral history.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span>Authenticity Rating</span>
                                <span className="text-amber-400">4.9/5</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="w-[98%] h-full bg-amber-400"></div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-4">
                                <span>Collection Growth</span>
                                <span className="text-amber-400">+12% Monthly</span>
                            </div>
                        </div>
                    </div>

                    {currentUser ? (
                        <div className="bg-white p-6 rounded-[1.2rem] border border-stone-100 shadow-sm space-y-6">
                            <h4 className="font-black text-sm uppercase tracking-widest text-stone-900 flex items-center gap-2">
                                <MessageSquare size={16} className="text-[#5c1111]" /> Leave a Review
                            </h4>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase text-stone-400 mb-2">Sacred Score</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button 
                                                key={star}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                                className={`transition-all ${newReview.rating >= star ? 'text-amber-500 scale-110' : 'text-stone-200 hover:text-amber-200'}`}
                                            >
                                                <Star size={20} fill={newReview.rating >= star ? 'currentColor' : 'none'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-stone-400 mb-2">Your Story</p>
                                    <textarea 
                                        required
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="w-full p-5 bg-[#f8f6f2] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#5c1111]/20 transition-all text-sm min-h-[120px] resize-none"
                                        placeholder="Share your experience with this artifact..."
                                    />
                                </div>
                                <button 
                                    disabled={isSubmittingReview}
                                    type="submit" 
                                    className="w-full bg-[#2a2723] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5c1111] transition-all disabled:opacity-50"
                                >
                                    {isSubmittingReview ? 'Preserving...' : 'Submit Review'} <Send size={14} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="p-8 bg-stone-50 rounded-[2.5rem] text-center space-y-4 border border-stone-100">
                            <p className="text-sm font-medium text-stone-400 italic">Sign in to share your appreciation for this masterpiece.</p>
                            <Link to="/login" className="inline-block text-[10px] font-black uppercase tracking-widest text-[#5c1111] hover:underline">Sign In Now</Link>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-8 space-y-12">
                    <div className="flex items-center gap-4">
                        <SectionHeading subtitle="Collector feedback" title="Voices of the Gallery" />
                    </div>

                    {reviews.length === 0 ? (
                        <div className="py-20 text-center space-y-6 bg-[#f8f6f2] rounded-[4rem] border border-dashed border-stone-200">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-stone-200 shadow-sm"><MessageSquare size={32} /></div>
                            <p className="text-stone-400 font-light italic">This piece awaits its first collector's voice.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-white p-4 rounded-[1.2rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all group animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#efece6] rounded-xl flex items-center justify-center font-black text-[#5c1111] text-lg shadow-inner">
                                                <img src={review.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName || 'User')}&background=5c1111&color=fff&size=128`} alt="" className='w-full h-full object-cover rounded-[0.75rem]'/>
                                            </div>
                                            <div>
                                                <h5 className="font-black text-sm text-stone-900">{review.userName}</h5>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i >= review.rating ? 'text-stone-200' : ''} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-stone-600 font-playfair italic text-lg leading-relaxed pl-4 border-l-2 border-[#5c1111]/20">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
