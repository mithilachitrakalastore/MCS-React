import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Info, Quote, MessageSquare, History, Lightbulb, User } from 'lucide-react';
import { getArtAdvice } from '../geminiService.js';

export const ArtAdvicePage = () => {
    const [prompt, setPrompt] = useState('');
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chat, loading]);

    const askGemini = async () => {
        if (!prompt.trim() || loading) return;
        const msg = prompt;
        setPrompt('');
        setChat(prev => [...prev, { role: 'user', text: msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setLoading(true);
        
        try {
            const res = await getArtAdvice(msg);
            setChat(prev => [...prev, { role: 'ai', text: res, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } catch (error) {
            setChat(prev => [...prev, { role: 'ai', text: "The spirits of Mithila are momentarily silent. Please try again.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        { label: 'Symbolism of Fish', icon: '🐠' },
        { label: 'Natural Dye Secrets', icon: '🌿' },
        { label: 'Kachni vs Bharni', icon: '🎨' },
        { label: 'Art for New Homes', icon: '🏠' }
    ];

    return (
        <div className="pt-24 md:pt-32 pb-12 px-4 md:px-8 max-w-7xl mx-auto min-h-screen font-inter overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-[0.03]">
                <div className="absolute top-10 left-10 w-96 h-96 bg-[#5c1111] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#b36b00] rounded-full blur-[120px]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)] min-h-[600px]">
                
                {/* Sidebar - Suggestions & Info (Lg only) */}
                <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 animate-in slide-in-from-left duration-700">
                    <div className="p-8 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#5c1111] rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="font-playfair text-xl font-bold text-[#2a2723]">Digital Guardian</h2>
                                <p className="text-[10px] uppercase tracking-widest text-[#5c1111] font-black">Powered by Gemini</p>
                            </div>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed font-medium">
                            Explore the secret language of Mithila. Ask about patterns, traditions, or find the perfect piece for your space.
                        </p>
                    </div>

                    <div className="flex-1 p-8 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-xl flex flex-col">
                        <h3 className="flex items-center gap-2 font-playfair text-lg font-bold mb-6">
                            <Lightbulb size={18} className="text-[#b36b00]" />
                            <span>Oracle Wisdom</span>
                        </h3>
                        <div className="space-y-3 overflow-y-auto pr-2">
                            {suggestions.map((item, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setPrompt(item.label)}
                                    className="group w-full text-left p-4 bg-white/60 hover:bg-[#5c1111] rounded-2xl transition-all duration-300 border border-white/40 hover:border-[#5c1111] shadow-sm hover:shadow-md flex items-center gap-3"
                                >
                                    <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>
                                    <span className="text-xs font-bold text-stone-700 group-hover:text-white transition-colors">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Chat Interface */}
                <div className="lg:col-span-9 flex flex-col bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                    
                    {/* Chat Header */}
                    <div className="p-6 md:px-10 md:py-8 border-b border-stone-100 flex items-center justify-between bg-white/20">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#5c1111] to-[#2a2723] rounded-2xl shadow-xl flex items-center justify-center">
                                    <Quote size={24} className="text-white/90" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h1 className="font-playfair text-xl md:text-2xl font-black text-[#2a2723]">Mithila <span className="italic text-[#5c1111]">Oracle</span></h1>
                                <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Always Listening to Tradition
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="hidden md:flex p-3 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all text-stone-500" title="History">
                                <History size={20} />
                            </button>
                            <button className="p-3 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all text-stone-500" title="Info">
                                <Info size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 md:space-y-8 scroll-smooth"
                    >
                        {chat.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center relative group">
                                    <div className="absolute inset-0 bg-[#5c1111] rounded-[2.5rem] scale-90 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <Sparkles size={40} className="text-[#5c1111] relative z-10 animate-subtle-float" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="font-playfair text-3xl font-bold text-[#2a2723]">Namaste</h2>
                                    <p className="text-stone-500 leading-relaxed font-medium">
                                        "Whisper your question about the sacred threads of tradition. I am here to guide your artistic journey."
                                    </p>
                                </div>
                                
                                {/* Mobile/Small suggestions */}
                                <div className="lg:hidden flex flex-wrap justify-center gap-2 pt-4">
                                     {suggestions.map((item, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setPrompt(item.label)}
                                            className="px-4 py-2 bg-white rounded-full text-[10px] font-bold border border-stone-200 shadow-sm"
                                        >
                                            {item.icon} {item.label}
                                        </button>
                                     ))}
                                </div>
                            </div>
                        ) : (
                            chat.map((msg, i) => (
                                <div 
                                    key={i} 
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in ${msg.role === 'user' ? 'slide-in-from-right-8' : 'slide-in-from-left-8'} duration-500`}
                                >
                                    <div className={`flex gap-3 md:gap-4 max-w-[92%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl shrink-0 flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-[#5c1111] text-white' : 'bg-[#2a2723] text-white'}`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className={`p-4 md:p-6 rounded-[2rem] shadow-sm relative ${
                                                msg.role === 'user' 
                                                ? 'bg-[#5c1111] text-white rounded-tr-none' 
                                                : 'bg-white text-[#2a2723] rounded-tl-none border border-stone-100'
                                            }`}>
                                                <p className={`text-sm md:text-base leading-relaxed ${msg.role === 'ai' ? 'font-playfair italic whitespace-pre-wrap' : 'font-medium'}`}>
                                                    {msg.text}
                                                </p>
                                            </div>
                                            <p className={`text-[10px] font-bold opacity-40 px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                {msg.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="flex justify-start animate-in slide-in-from-left-8 duration-500">
                                <div className="flex gap-4 max-w-[80%]">
                                    <div className="w-10 h-10 bg-[#2a2723] rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <Sparkles size={16} className="animate-spin" />
                                    </div>
                                    <div className="bg-white/80 p-5 rounded-[2rem] rounded-tl-none border border-stone-100 shadow-sm flex gap-2 items-center">
                                      <div className="w-2 h-2 bg-[#5c1111] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[#5c1111] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-[#5c1111] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Input Area */}
                    <div className="p-6 md:p-10 bg-white/40 border-t border-stone-100">
                        <div className="relative flex items-end gap-3 md:gap-4 max-w-4xl mx-auto">
                            <div className="relative flex-1 group">
                                <textarea 
                                    className="w-full p-5 md:p-6 pr-14 md:pr-16 bg-white rounded-[2rem] border-2 border-stone-100 focus:border-[#5c1111] outline-none text-sm md:text-base text-[#2a2723] resize-none h-16 md:h-20 transition-all shadow-inner font-medium scrollbar-hide"
                                    placeholder="Seek artistic wisdom..."
                                    name="Ai-Prompt-input"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askGemini())}
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-black uppercase text-stone-300 pointer-events-none group-focus-within:opacity-0 transition-opacity">
                                    Enter ↵
                                </div>
                            </div>
                            <button 
                                onClick={askGemini}
                                disabled={loading || !prompt.trim()}
                                className={`w-16 h-16 md:w-20 md:h-20 bg-[#5c1111] text-white rounded-[2rem] transition-all shadow-2xl flex items-center justify-center shrink-0 group ${loading || !prompt.trim() ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:bg-[#2a2723] hover:scale-105 active:scale-95'}`}
                            >
                                <Send size={24} className={`${!loading && prompt.trim() ? 'group-hover:translate-x-1 group-hover:-translate-y-1' : ''} transition-transform`} />
                            </button>
                        </div>
                        <p className="text-center mt-4 text-[10px] uppercase tracking-tighter text-stone-400 font-bold">
                            Respectfully bridging ancient heart with modern mind.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
