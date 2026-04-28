'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { ApiError, getCart, login, register, authenticateWithGoogle } from '@/lib/api';
import { useStore } from '@/store/store';
import Link from 'next/link';

type Mode = 'signin' | 'signup' | 'forgot';

const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function AuthPage() {
  const [mode, setMode]                 = useState<Mode>('signin');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [successMsg, setSuccessMsg]     = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const router = useRouter();
  const { setUser, setCartCount } = useStore();

  const syncCart = async () => {
    try {
      const cart = await getCart();
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    } catch { setCartCount(0); }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const data = await authenticateWithGoogle(tokenResponse.access_token);
        setUser(data.user);
        await syncCart();
        router.push('/account');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in was cancelled or failed.'),
  });

  // ── Email sign in ─────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await login(form.email, form.password);
      setUser(res.user);
      await syncCart();
      router.push('/account');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await register({ name: form.name.trim(), email: form.email, password: form.password });
      setUser(res.user);
      await syncCart();
      router.push('/account');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create account. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    await new Promise((r) => setTimeout(r, 900)); // simulated
    setSuccessMsg('If that address is registered, a reset link has been sent.');
    setLoading(false);
  };

  const switchMode = (next: Mode) => { setMode(next); setError(null); setSuccessMsg(null); };

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="block font-body text-[10px] tracking-[0.2em] text-[#6b7280] mb-2 uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="w-full px-4 py-3.5 border border-[#e5e0d8] focus:border-[#c9a96e] outline-none font-body text-sm bg-white transition-colors"
          required
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );

  const GoogleBtn = ({ label }: { label: string }) => (
    <button
      type="button"
      onClick={() => !loading && googleLogin()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3.5 border border-[#e5e0d8] hover:border-[#c9a96e] hover:bg-[#f7f4ef] disabled:opacity-50 font-body text-xs tracking-[0.1em] transition-all"
    >
      <GoogleIcon /> {label}
    </button>
  );

  const Divider = () => (
    <div className="relative flex items-center">
      <div className="flex-1 border-t border-[#e5e0d8]" />
      <span className="px-3 font-body text-xs text-[#6b7280]">or</span>
      <div className="flex-1 border-t border-[#e5e0d8]" />
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-ivory)' }}>

      {/* Left decorative panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden"
        style={{ background: '#0a0a0a' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=70"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.2) 100%)' }} />
        </div>
        <div className="relative z-10">
          <Link href="/" className="font-display text-2xl tracking-[0.3em] text-[#c9a96e]">
            TANTA
          </Link>
        </div>
        <div className="relative z-10">
          <p className="font-display text-3xl font-light text-white leading-relaxed mb-3">
            &ldquo;Fashion is the armour to<br />survive everyday life.&rdquo;
          </p>
          <p className="font-body text-xs tracking-[0.15em] text-white/40">— DIANA VREELAND</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 font-body text-xs text-[#6b7280] hover:text-[#0a0a0a] mb-10 transition-colors">
            <ArrowLeft size={13} /> Back to store
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-light tracking-tight mb-2">
              {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
            </h1>
            {mode !== 'forgot' && (
              <p className="font-body text-sm text-[#6b7280]">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-[#c9a96e] hover:underline font-medium"
                >
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            )}
          </div>

          {/* Alert messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 font-body text-sm rounded"
              >
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 px-4 py-3 bg-[#f7f4ef] border border-[#c9a96e] text-[#9a7a42] font-body text-sm rounded"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* Sign in */}
            {mode === 'signin' && (
              <motion.form key="signin" onSubmit={handleSignIn}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.22 }} className="space-y-4">
                {field('email', 'Email Address', 'email', 'you@example.com')}
                {field('password', 'Password', 'password', '••••••••')}
                <div className="text-right -mt-1">
                  <button type="button" onClick={() => switchMode('forgot')}
                    className="font-body text-xs text-[#6b7280] hover:text-[#c9a96e] transition-colors">
                    Forgot password?
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-[#0a0a0a] hover:bg-[#1a1a1a] disabled:opacity-50 text-white font-body text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                  {loading ? <><Loader size={13} className="animate-spin" /> SIGNING IN…</> : 'SIGN IN'}
                </button>
                <Divider />
                <GoogleBtn label="Continue with Google" />
              </motion.form>
            )}

            {/* Sign up */}
            {mode === 'signup' && (
              <motion.form key="signup" onSubmit={handleSignUp}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }} className="space-y-4">
                {field('name', 'Full Name', 'text', 'Your name')}
                {field('email', 'Email Address', 'email', 'you@example.com')}
                {field('password', 'Password', 'password', 'Min. 8 characters')}
                {field('confirmPassword', 'Confirm Password', 'password', '••••••••')}
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-[#0a0a0a] hover:bg-[#1a1a1a] disabled:opacity-50 text-white font-body text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                  {loading ? <><Loader size={13} className="animate-spin" /> CREATING…</> : 'CREATE ACCOUNT'}
                </button>
                <Divider />
                <GoogleBtn label="Continue with Google" />
                <p className="font-body text-xs text-[#6b7280] text-center">
                  By signing up you agree to our{' '}
                  <Link href="/terms" className="text-[#c9a96e] hover:underline">Terms</Link>
                  {' & '}
                  <Link href="/privacy" className="text-[#c9a96e] hover:underline">Privacy Policy</Link>
                </p>
              </motion.form>
            )}

            {/* Forgot */}
            {mode === 'forgot' && (
              <motion.form key="forgot" onSubmit={handleForgot}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }} className="space-y-4">
                <p className="font-body text-sm text-[#6b7280]">
                  Enter your email and we will send a reset link.
                </p>
                {field('email', 'Email Address', 'email', 'you@example.com')}
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-[#0a0a0a] hover:bg-[#1a1a1a] disabled:opacity-50 text-white font-body text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                  {loading ? <><Loader size={13} className="animate-spin" /> SENDING…</> : 'SEND RESET LINK'}
                </button>
                <button type="button" onClick={() => switchMode('signin')}
                  className="w-full text-center font-body text-xs text-[#6b7280] hover:text-[#0a0a0a] transition-colors py-2">
                  ← Back to sign in
                </button>
              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
