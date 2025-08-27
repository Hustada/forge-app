import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthFormProps {
  onClose: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
  const { signIn, signUp, resendConfirmation, resetPassword, isOfflineMode } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleResendConfirmation = async () => {
    setError('');
    setLoading(true);
    
    try {
      await resendConfirmation(email);
      setError('Confirmation email sent! Check your inbox.');
      setShowResend(false);
    } catch (err: any) {
      setError('Failed to resend confirmation email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setError('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setIsForgotPassword(false);
          setError('');
        }, 3000);
      } else if (isSignUp) {
        await signUp(email, password);
        setError('Check your email to confirm your account.');
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err: any) {
      // Handle specific error cases
      if (err.message?.includes('Email not confirmed')) {
        setError('Please confirm your email first. Check your inbox for the confirmation link.');
        setShowResend(true);
      } else if (err.message?.includes('User already registered')) {
        setError('This email is already registered. Please sign in instead.');
        setShowResend(false);
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password.');
        setShowResend(false);
      } else {
        setError(err.message);
        setShowResend(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isOfflineMode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="forge-card p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline text-xl uppercase tracking-wide text-mournshard">
            Offline Mode
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-steel rounded">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
        
        <p className="text-text-muted text-sm">
          Running in offline mode. Data stored locally only.
        </p>
        <p className="text-mournshard text-xs mt-4">
          Configure Supabase credentials to enable cloud sync.
        </p>
        
        <button
          onClick={onClose}
          className="forge-button bg-steel text-text-primary hover:bg-steel-light w-full mt-6"
        >
          Continue Offline
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="forge-card p-6 w-full max-w-md"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-xl uppercase tracking-wide text-mournshard">
          {isForgotPassword ? 'Reset Password' : isSignUp ? 'Begin The Forge' : 'Return to The Forge'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-steel rounded">
          <X className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 bg-steel border border-steel-light rounded text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-mournshard"
          />
        </div>
        
        {!isForgotPassword && (
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-steel border border-steel-light rounded text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-mournshard"
            />
          </div>
        )}

        {error && (
          <div>
            <p className={`text-sm ${error.includes('email') || error.includes('sent') ? 'text-mournshard' : 'text-shadow'}`}>
              {error}
            </p>
            {showResend && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={loading}
                className="mt-2 text-xs text-mournshard hover:text-ember underline"
              >
                Resend confirmation email
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="forge-button bg-mournshard text-void hover:bg-ember w-full py-3 flex items-center justify-center gap-2"
        >
          <Flame className="w-5 h-5" />
          {loading ? 'Forging...' : 
           isForgotPassword ? 'Send Reset Link' :
           isSignUp ? 'Start 90-Day Forge' : 'Enter The Forge'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        {!isForgotPassword && (
          <>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setShowResend(false);
              }}
              className="text-text-muted text-sm hover:text-mournshard block w-full"
            >
              {isSignUp ? 'Already forged? Sign in' : 'New to The Forge? Begin your journey'}
            </button>
            {!isSignUp && (
              <button
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setShowResend(false);
                }}
                className="text-text-muted text-xs hover:text-mournshard"
              >
                Forgot your password?
              </button>
            )}
          </>
        )}
        {isForgotPassword && (
          <button
            onClick={() => {
              setIsForgotPassword(false);
              setError('');
            }}
            className="text-text-muted text-sm hover:text-mournshard"
          >
            Back to sign in
          </button>
        )}
      </div>

      {isSignUp && (
        <div className="mt-6 p-4 bg-steel/50 rounded border border-steel-light">
          <p className="text-xs text-mournshard font-wisdom italic text-center">
            "Power lives in repetition, not in flashes."
          </p>
        </div>
      )}
    </motion.div>
  );
};