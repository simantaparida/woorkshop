'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/lib/constants';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/home';
  const errorParam = searchParams?.get('error');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === 'auth_failed'
      ? 'Authentication failed. Please try again.'
      : errorParam === 'no_session'
      ? 'No active session found. Please sign in again.'
      : null
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [figmaLoading, setFigmaLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(redirectTo);
      }
    }
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push(redirectTo);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, redirectTo]);

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      setSuccessMessage(null);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}?redirect=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  const handleFigmaAuth = async () => {
    try {
      setFigmaLoading(true);
      setError(null);
      setSuccessMessage(null);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'figma',
        options: {
          redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      console.error('Figma auth error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Figma');
      setFigmaLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Sign in with email
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Redirect will happen automatically via auth state change
      router.push(redirectTo);
    } catch (err) {
      console.error('Email auth error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with email');
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccessMessage('Password reset link has been sent to your email.');
      setShowPasswordReset(false);
      setLoading(false);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send password reset email');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMessage(null);
    setShowPasswordReset(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="font-comfortaa text-3xl font-bold text-blue-600 tracking-[0.1em]">
                woorkshop
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h1>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
            >
              {successMessage}
            </motion.div>
          )}

          {/* Google Auth Button */}
          <Button
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            isLoading={googleLoading}
            variant="outline"
            size="lg"
            className="w-full mb-6 border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          {/* Figma Auth Button - Hidden for now */}
          {/* <Button
            onClick={handleFigmaAuth}
            disabled={googleLoading || figmaLoading || loading}
            isLoading={figmaLoading}
            variant="outline"
            size="lg"
            className="w-full border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none">
              <path d="M7.5 3h4.5v4.5H7.5a2.25 2.25 0 110-4.5z" fill="#F24E1E"/>
              <path d="M12 3h4.5a2.25 2.25 0 110 4.5H12V3z" fill="#FF7262"/>
              <path d="M12 7.5h4.5a2.25 2.25 0 110 4.5H12V7.5z" fill="#A259FF"/>
              <path d="M7.5 7.5H12V12H7.5a2.25 2.25 0 110-4.5z" fill="#1ABCFE"/>
              <path d="M12 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" fill="#0ACF83"/>
            </svg>
            {figmaLoading ? 'Signing in...' : 'Sign in with Figma'}
          </Button> */}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Email Auth Form */}
          <form onSubmit={showPasswordReset ? handlePasswordReset : handleEmailAuth} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || googleLoading}
              autoComplete="email"
            />

            {!showPasswordReset && (
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!showPasswordReset}
                  disabled={loading || googleLoading}
                  autoComplete="current-password"
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {!showPasswordReset && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepMeLoggedIn}
                    onChange={(e) => setKeepMeLoggedIn(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Keep me logged in</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {showPasswordReset && (
              <div className="text-sm text-gray-600">
                <p>Enter your email address and we'll send you a link to reset your password.</p>
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(false)}
                  className="mt-2 text-blue-600 hover:text-blue-700 hover:underline"
                >
                  ← Back to sign in
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || googleLoading}
              isLoading={loading}
              variant="primary"
              size="lg"
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              {loading
                ? showPasswordReset
                  ? 'Sending...'
                  : 'Signing in...'
                : showPasswordReset
                ? 'Send reset link'
                : 'Sign in'}
            </Button>
          </form>

          {/* Link to Sign up */}
          {!showPasswordReset && (
            <div className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{' '}
              <Link
                href={ROUTES.SIGNUP}
                className="text-blue-600 font-medium hover:text-blue-700 hover:underline"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to Woorkshop's{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </motion.svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

