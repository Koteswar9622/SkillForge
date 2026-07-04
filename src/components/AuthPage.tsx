import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: { id: string; email: string }) => void;
  onGoBack: () => void;
}

export default function AuthPage({ onAuthSuccess, onGoBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please check your credentials.');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans flex flex-col justify-center items-center relative overflow-hidden bg-slate-950 px-4">
      {/* Background circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={onGoBack}
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white transition-all cursor-pointer"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Landing
      </button>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl relative"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shadow-lg mb-4">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {isLogin
              ? 'Sign in to access your interactive AI tutors and personalized engineering roadmaps.'
              : 'Enter your email to unlock your multi-agent educational pipeline.'}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs mb-5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@yourdomain.com"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {isLogin ? 'Authenticating...' : 'Registering Account...'}
              </>
            ) : (
              isLogin ? 'Access Platform' : 'Initialize Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer underline underline-offset-4"
          >
            {isLogin
              ? "Don't have an account? Complete Registration"
              : 'Already have an account? Sign In'}
          </button>
        </div>

        {/* Credentials hints for quick hackathon review */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col gap-1.5 text-center text-[11px] font-mono text-slate-500">
          <p className="font-semibold text-slate-400">⚡ Hackathon Quick Testing Credentials:</p>
          <p>Any email format is accepted (e.g., student@forge.com)</p>
          <p>Password can be anything (or keep it simple: 123456)</p>
        </div>
      </motion.div>
    </div>
  );
}
