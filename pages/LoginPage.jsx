import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbservices';
import { supabase } from '../services/supabaseClient';
import { SectionHeading } from '../components/SectionHeading';
import { Sparkles, Mail, ArrowRight, Lock, User as UserIcon, Store, Phone, MapPin } from 'lucide-react';

export const LoginPage = ({ onLogin }) => {
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'completeProfile'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [picture, setPicture] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [role, setRole] = useState('customer');
    const [storeName, setStoreName] = useState('');
    const [error, setError] = useState(''); 
    const [googleProfile, setGoogleProfile] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                handleGoogleSession(session);
            }
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                handleGoogleSession(session);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleGoogleSession = async (session) => {
        try {
            const picture = session.user.user_metadata.avatar_url;
            const email = session.user.email;
            const name = session.user.user_metadata.full_name || session.user.email;
            const avatar_url = session.user.user_metadata.avatar_url;

            const existingUser = await dbService.getUserByEmail(email);
            if (existingUser) {
                await supabase.auth.signOut();
                onLogin(existingUser);
            } else {
                setAuthMode('completeProfile');
                setName(name);
                setEmail(email);
                setGoogleProfile({ email, name, avatar_url });
            }
        } catch (err) {
            console.error("Error handling Google session:", err);
            setError("Failed to verify Google account.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // Redirect back to login page
                    redirectTo: window.location.origin + window.location.pathname + '#/login'
                }
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            if (authMode === 'login') {
                const user = await dbService.login(username, password);
                if (user) onLogin(user);
                else setError('Invalid credentials or inactive account.');
            } else if (authMode === 'register') {
                const newUser = await dbService.register({                    username,
                    password,
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
                    setAuthMode('login');
                } else {
                    onLogin(newUser);
                }
            } else if (authMode === 'completeProfile') {
                if (!phone || !address || !city) {
                    setError('Please fill in contact details.');
                    return;
                }
                const randomPart = Math.random().toString(36).substr(2, 4);
                const generatedUsername = googleProfile.email.split('@')[0] + randomPart;

                const newUser = await dbService.registerGoogleUser({
                    picture: googleProfile.avatar_url,
                    email: googleProfile.email,
                    name: googleProfile.name,
                    phone,
                    address,
                    city,
                    username: generatedUsername,
                    // No password needed for Google users
                });
                
                await supabase.auth.signOut();
                onLogin(newUser);
            }
        } catch (err) {
            setError(err.message || 'An error occurred.');
        }
    };

    return (
        <div className="pt-40 pb-32 px-6 max-w-xl mx-auto min-h-screen">
            <div className="bg-[#f8f6f2] rounded-[4rem] p-10 md:p-10 border border-[#e5e1d8] shadow-2xl mithila-card-shadow">
                <SectionHeading 
                    subtitle={authMode === 'login' ? "Welcome Back" : authMode === 'register' ? "Join the Circle" : "Complete Profile"} 
                    title={authMode === 'login' ? "Artist Portal" : authMode === 'register' ? "New Heritage" : "Almost Done"} 
                    centered 
                />
                
                {error && <p className="text-red-700 text-center mb-6 font-bold text-xs">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {authMode === 'completeProfile' && (
                        <div className="space-y-6">
                            <p className="text-center text-xs text-stone-500 mb-6">
                                We need a bit more info to establish your heritage profile.
                            </p>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Your Full Name</label>
                                <div className="relative">
                                    <UserIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <input required readOnly value={name} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] opacity-70 rounded-2xl outline-none font-medium cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Phone Number</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <input required value={phone} title='Enter Your Contact Number' onChange={e => setPhone(e.target.value)} type="tel" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Address</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <input required value={address} title='Enter Your Address' onChange={e => setAddress(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">City</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <input required value={city} title='Enter Your City' onChange={e => setCity(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[#5c1111] text-white py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl premium-shadow hover:bg-[#2a2723] hover:-translate-y-1 transition-all">
                                Establish Heritage
                            </button>
                        </div>
                    )}

                    {authMode !== 'completeProfile' && (
                        <>
                            {authMode === 'register' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Your Full Name</label>
                                        <div className="relative">
                                            <UserIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <input required value={name} title='Enter Your Full Name' onChange={e => setName(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <input required value={email} title='Enter Your E-mail Address' onChange={e => setEmail(e.target.value)} type="email" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                        </div>
                                    </div>
                                    {role === 'customer' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Phone Number</label>
                                                <div className="relative">
                                                    <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                                    <input value={phone} title='Enter Your Contact Number' onChange={e => setPhone(e.target.value)} type="tel" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Address</label>
                                                <div className="relative">
                                                    <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                                    <input value={address} title='Enter Your Address' onChange={e => setAddress(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">City</label>
                                                <div className="relative">
                                                    <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                                    <input value={city} title='Enter Your City' onChange={e => setCity(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
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
                                    <input required value={username} title='Enter Your Username' onChange={e => setUsername(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <input required value={password} title='Enter Your Password' onChange={e => setPassword(e.target.value)} type="password" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                </div>
                            </div>

                            {authMode === 'register' && (
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
                                                    <input required value={storeName} title='Enter Your Store Name' onChange={e => setStoreName(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Phone Number</label>
                                                <div className="relative">
                                                    <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                                    <input value={phone} title='Enter Your Store Contact Number' onChange={e => setPhone(e.target.value)} type="tel" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">Address</label>
                                                <div className="relative">
                                                    <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                                    <input value={address} title='Enter Your Store Address' onChange={e => setAddress(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black uppercase text-stone-400 pl-4">City</label>
                                                <div className="relative">
                                                    <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                                                    <input value={city} title='Enter Your Store Located City' onChange={e => setCity(e.target.value)} type="text" className="w-full pl-12 pr-6 py-4 bg-[#efece6] rounded-2xl outline-none focus:bg-white border border-transparent focus:border-[#5c1111]/20 transition-all font-medium" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <button type="submit" className="w-full bg-[#5c1111] text-white py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl premium-shadow hover:bg-[#2a2723] hover:-translate-y-1 transition-all">
                                {authMode === 'login' ? "Authorize Entry" : "Establish Heritage"}
                            </button>

                            {/* Google Sign In option only for customer login or register */}
                            {(authMode === 'login' || (authMode === 'register' && role === 'customer')) && (
                                <div className="pt-4 border-t border-stone-200 mt-4 flex flex-col items-center">
                                    <p className="text-[10px] font-black uppercase text-stone-400 mb-4">Or For Customers</p>
                                    <button 
                                        type="button" 
                                        onClick={handleGoogleLogin} 
                                        className="w-full bg-white text-stone-600 border border-stone-200 py-4 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-md hover:bg-stone-50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 48 48" className="inline-block">
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                        </svg>
                                        Sign in with Google
                                    </button>
                                </div>
                            )}

                            <button type="button" onClick={() => {
                                setAuthMode(authMode === 'login' ? 'register' : 'login');
                                setError('');
                            }} className="md:flex justify-center w-full text-[10px] font-black uppercase text-stone-400 hover:text-[#5c1111] transition-colors mt-6">
                                {authMode === 'login' ? (
                                    <>
                                        Not registered? 
                                        <span className="text-blue-600 ml-1">Create new account here</span>
                                    </>
                                ) : (
                                    <>
                                        Already registered? 
                                        <span className="text-blue-600 ml-1">Sign in</span>
                                    </>
                                )}
                                <ArrowRight size={16} />
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};
