
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { loginWithEmail } from '../services/firebaseService';
import { User } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let loggedInUser;
      
      try {
        // Attempt actual Firebase login
        const credential = await loginWithEmail(email, password);
        loggedInUser = {
            id: credential.user.uid,
            email: credential.user.email
        };
      } catch (authError: any) {
        // Fallback for Demo Mode if Firebase isn't set up
        if (authError.message === 'FIREBASE_NOT_CONFIGURED') {
            if (email === 'demo@example.com' && password === 'password') {
                loggedInUser = { id: 'demo-user', email: 'demo@example.com' };
                // Simulate network delay for realism in demo mode
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                throw new Error("Invalid credentials. For demo, use: demo@example.com / password");
            }
        } else {
            // Re-throw real auth errors
            throw authError;
        }
      }

      // Construct Application User Object
      const mockUser: User = {
        id: loggedInUser.id || 'user-' + Date.now(),
        firstName: 'Demo',
        lastName: 'User',
        email: loggedInUser.email || email,
        phone: '555-0123',
        role: 'USER',
        creditScore: {
          equifax: 580,
          experian: 592,
          transunion: 575
        },
        negativeItems: [
            {
                id: 'item-1',
                type: 'Collection',
                creditor: 'Midland Credit',
                accountNumber: '****4921',
                amount: 450,
                dateReported: '2023-10-15',
                bureau: ['Equifax' as any],
                status: 'Open' as const
            }
        ]
      };

      login(mockUser);
      setIsLoading(false);
      navigate('/dashboard');

    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] -z-10" />
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-lg shadow-orange-900/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">CreditFix AI</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome Back</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">Enter your credentials to access your dashboard.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">Password</label>
                <a href="#" className="text-xs text-orange-500 hover:text-orange-400 font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(234,88,12,0.3)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/onboarding" className="font-bold text-orange-500 hover:text-orange-400 transition-colors">
                Start Free Trial
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-8">
          &copy; 2024 CreditFix AI. Secure 256-bit Encryption.
        </p>
      </div>
    </div>
  );
};

export default Login;
