import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Send } from 'lucide-react';

export const Footer = () => (
    <footer className="bg-stone-950 text-white pt-24 pb-[110px] px-6 print:hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-row-4 gap-16">
            <div className="col-span-1 md:col-span-1 space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black">
                        <img 
                          className="w-8 h-8 rounded-[0.5rem]"
                          src="https://res.cloudinary.com/djmbuuz28/image/upload/v1761108817/logo.png" 
                          alt="Logo" 
                        />
                    </div>
                    <h3 className="font-dancing text-2xl font-bold text-red-600">Mithila Chitrakala</h3>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed font-light">
                    Elevating thousands of years of Mithila tradition to the modern stage. We work directly with rural artisans to bring their divine stories to your home.
                </p>
                <div className="flex gap-4">
                    <a href="https://www.instagram.com/mithilachitrakalastore" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-red-800 transition-colors" target='_blank'><Instagram size={18} /></a>
                    <a href="https://www.facebook.com/profile.php?id=61578104247563" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-red-800 transition-colors" target='_blank'><Facebook size={18} /></a>
                    <a href="https://www.tiktok.com/@mithila_chitrakala" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-red-800 transition-colors" target='_blank'><i className="fa-brands fa-tiktok"></i></a>
                </div>
            </div> 

            <div className='max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16'>
            <div>
                <h4 className="font-playfair text-xl font-black mb-8 text-amber-500">The Vault</h4>
                <ul className="space-y-4 text-stone-500 text-[11px] font-black uppercase tracking-widest">
                    <li><Link to="/products" className="hover:text-white transition-colors">Our Collection</Link></li>
                    <li><Link to="/advice" className="hover:text-white transition-colors">AI Art Consultant</Link></li>
                    <li><Link to="/products" className="hover:text-white transition-colors">Limited Editions</Link></li>
                    <li><Link to="/products" className="hover:text-white transition-colors">Artisan Stories</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-playfair text-xl font-black mb-8 text-amber-500">Concierge</h4>
                <ul className="space-y-4 text-stone-500 text-[11px] font-black uppercase tracking-widest">
                    <li><Link to="/profile" className="hover:text-white transition-colors" title='Track Your Order'>Track Collection</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors" title='Authentication'>Authentication</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors" title='Shipping & Returns'>Shipping & Returns</Link></li>
                    <li><Link to="/privacy-policy" className="hover:text-white transition-colors" title='Privacy Policy'>Privacy Circle</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-playfair text-xl font-black mb-8 text-amber-500">Journal</h4>
                <p className="text-stone-500 text-[11px] mb-4 font-black uppercase tracking-widest">Join our circle for heritage drops.</p>
                <div className="flex gap-2 md:gap-1">
                    <input type="email" placeholder="Join the list..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm flex-1 focus:outline-none focus:border-red-800" />
                    <button className="bg-red-800 px-4 py-3 rounded-xl hover:bg-red-700 transition-colors"><Send size={16} /></button>
                </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-20 pt-10 text-center flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.3em]">
                &copy; 2025 Mithila Chitrakala Store &bull; Heritage Reserved
            </p>
            <div className="flex gap-5 md:gap-6 grayscale opacity-90">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-3 md:h-4 " alt="PayPal" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg" className="h-3 md:h-4" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3 md:h-4" alt="Mastercard" />
                <img src="https://cdn.brandfetch.io/idDVuHZ3OK/w/124/h/33/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1751351341090" className='h-4 md:h-5' alt="E-Sewa" />
                <img src="https://cdn.brandfetch.io/idGPw_2fQs/w/1513/h/575/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B" className="h-5 md:h-6" alt="Khalti" />
            </div>
        </div>
    </footer>
);
