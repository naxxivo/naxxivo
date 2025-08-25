import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

type AuthMode = 'login' | 'signup';

const NaxStoreLogo: React.FC = () => (
    <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-center">
        Nax<span className="text-yellow-400">Store</span>
    </h1>
);

const Auth: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else if (data.user) {
                 if (data.user.identities && data.user.identities.length === 0) {
                    setMessage('User with this email already exists. Please sign in.');
                    setIsLoading(false);
                    return;
                }
                // Create a corresponding profile for the new user with a default is_admin value
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([{ id: data.user.id, name: fullName, is_admin: false }]);

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    // This is a critical error, but we can still inform the user about verification
                    setError('Account created, but failed to set up your profile. Please contact support.');
                } else {
                    setMessage('Success! Please check your email to verify your account.');
                }
            }
        }
        setIsLoading(false);
    };

    const toggleMode = () => {
        setMode(prevMode => (prevMode === 'login' ? 'signup' : 'login'));
        setError(null);
        setMessage(null);
    };

    const isLogin = mode === 'login';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 animate-fade-in">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="mb-8 text-center">
                    <NaxStoreLogo />
                    <p className="text-gray-500 mt-2">{isLogin ? 'Welcome back! Please sign in.' : 'Create an account to get started.'}</p>
                </div>

                {error && <p className="mb-4 text-center text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                {message && <p className="mb-4 text-center text-sm text-green-600 bg-green-100 p-3 rounded-lg">{message}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-2">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                                placeholder="Your Name"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-2">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    {isLogin && (
                        <div className="flex items-center justify-between text-sm">
                            <a href="#" className="font-medium text-yellow-500 hover:text-yellow-600">
                                Forgot password?
                            </a>
                        </div>
                    )}
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </div>
                </form>
                <p className="mt-8 text-center text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={toggleMode} className="font-medium text-yellow-500 hover:text-yellow-600">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;