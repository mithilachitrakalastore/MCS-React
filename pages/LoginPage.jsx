import React, { useState } from 'react';
import { dbService } from '../services/dbservices';
import { SectionHeading } from '../components/SectionHeading';
import { Sparkles, Mail, ArrowRight, Lock, User as UserIcon, Store, Phone, MapPin } from 'lucide-react';

export const LoginPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [role, setRole] = useState('customer');
    const [storeName, setStoreName] = useState('');
    const [error, setError] = useState(''); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (isLogin) {
            const user = await dbService.login(username, password);
            if (user) onLogin(user);
            else setError('Invalid credentials or inactive account.');
        } else {
            const newUser = await dbService.register({
                username,
                password_hash: password,
                name,
                email,
                role,
                phone: phone || undefined,
                address: address || undefined,
                city: city || undefined,
                storeName: role === 'seller' ? storeName : undefined
            });
            if (newUser.status === 'disabled') {
                alert('Registration successful! Your seller account is deactivated by default. Contact admin to activate.');
                setIsLogin(true);
            } else {
                onLogin(newUser);
            }
        }
    };

    return (
        <div className="pt-40 pb-32 px-6 max-w-xl mx-auto min-h-screen">
            <div className="bg-[#f8f6f2] rounded-[4rem] p-10 md:p-16 border border-[#e5e1d8] shadow-2xl mithila-card-shadow">
                <SectionHeading 
                    subtitle={isLogin ? "Welcome Back" : "Join the Circle"} 
                    title={isLogin ? "Artist Portal" : "New Heritage"} 
                    centered 
                />
                
                {error && <p className="text-red-700 text-center mb-6 font-bold text-xs">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Your Full Name</label>
                                <div className="relative">
                                    <UserIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                </div>
                            </div>
                            {role === 'customer' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Address</label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <input value={address} onChange={e => setAddress(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">City</label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <input value={city} onChange={e => setCity(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Username</label>
                        <div className="relative">
                            <Sparkles size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                            <input required value={username} onChange={e => setUsername(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                            <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-4 pt-4 border-t border-stone-200">
                            <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Account Type</label>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setRole('customer')} className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${role === 'customer' ? 'bg-[#5c1111] text-white border-[#5c1111]' : 'bg-white text-stone-400 border-stone-200'}`}>Customer</button>
                                <button type="button" onClick={() => setRole('seller')} className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${role === 'seller' ? 'bg-[#5c1111] text-white border-[#5c1111]' : 'bg-white text-stone-400 border-stone-200'}`}>Artisan</button>
                            </div>
                            {role === 'seller' && (
                                <>
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Studio Name</label>
                                        <div className="relative">
                                            <Store size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <input required value={storeName} onChange={e => setStoreName(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Address</label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <input value={address} onChange={e => setAddress(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">City</label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <input value={city} onChange={e => setCity(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-[#5c1111] text-white py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl premium-shadow hover:bg-[#2a2723] hover:-translate-y-1 transition-all">
                        {isLogin ? "Authorize Entry" : "Establish Heritage"}
                    </button>

                    <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-[10px] font-black uppercase text-stone-400 hover:text-[#5c1111] transition-colors">
                        {isLogin ? "I don't have account, Create new account" : "Already registered? Sign in"} <ArrowRight size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};
