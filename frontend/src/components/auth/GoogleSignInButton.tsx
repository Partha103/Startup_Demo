'use client';

import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { ApiError, authenticateWithGoogle, getCart } from '@/lib/api';
import { useStore } from '@/store/store';
import { useRouter } from 'next/navigation';

interface GoogleSignInButtonProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * GoogleSignInButton
 * Wrapped component for Google OAuth login that only renders when GoogleOAuthProvider is available
 */
export function GoogleSignInButton({ loading, setLoading, setError }: GoogleSignInButtonProps) {
  const { setUser, setCartCount } = useStore();
  const router = useRouter();

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        setLoading(true);
        setError(null);

        // Exchange Google token for backend session
        const authResponse = await authenticateWithGoogle(codeResponse.access_token);
        setUser(authResponse.user);

        try {
          const cart = await getCart();
          setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
        } catch {
          setCartCount(0);
        }

        router.push('/account');
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          console.error('Google authentication failed:', err);
          setError('Unable to sign in with Google. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in failed. Please try again.');
    },
    flow: 'implicit',
  });

  return (
    <motion.button
      type="button"
      onClick={() => googleLogin()}
      disabled={loading}
      className="w-full py-4 border-2 border-black hover:border-black disabled:opacity-50 text-black font-body font-semibold tracking-wider transition-all flex items-center justify-center gap-2 uppercase hover:bg-gray-100"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Mail size={18} />
      {loading ? 'Signing In...' : 'Continue with Google'}
    </motion.button>
  );
}

/**
 * Fallback button to display when GoogleOAuthProvider is not available or not configured
 */
export function GoogleSignInButtonFallback() {
  return (
    <button
      disabled
      className="w-full py-4 border-2 border-gray-300 bg-gray-50 disabled:opacity-50 text-gray-600 font-body font-semibold tracking-wider uppercase cursor-not-allowed flex items-center justify-center gap-2"
    >
      <Mail size={18} />
      Google Sign-in Not Available
    </button>
  );
}
