import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthFormProps {
  onClose: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
  const { signIn, signUp, isOfflineMode } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError('Check your email to confirm your account.');
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
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
          {isSignUp ? 'Begin The Forge' : 'Return to The Forge'}
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

        {error && (
          <p className={`text-sm ${error.includes('email') ? 'text-mournshard' : 'text-shadow'}`}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="forge-button bg-mournshard text-void hover:bg-ember w-full py-3 flex items-center justify-center gap-2"
        >
          <Flame className="w-5 h-5" />
          {loading ? 'Forging...' : (isSignUp ? 'Start 90-Day Forge' : 'Enter The Forge')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          className="text-text-muted text-sm hover:text-mournshard"
        >
          {isSignUp ? 'Already forged? Sign in' : 'New to The Forge? Begin your journey'}
        </button>
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