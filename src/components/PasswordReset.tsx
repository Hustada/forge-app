import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const PasswordReset: React.FC = () => {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we're on the recovery page
    if (!window.location.hash?.includes('type=recovery')) {
      window.location.href = '/';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await updatePassword(newPassword);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="forge-card p-6 w-full max-w-md text-center"
        >
          <CheckCircle className="w-12 h-12 text-mournshard mx-auto mb-4" />
          <h2 className="font-headline text-xl uppercase tracking-wide text-mournshard mb-2">
            Password Reset
          </h2>
          <p className="text-text-muted">Your password has been updated. Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="forge-card p-6 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Lock className="w-12 h-12 text-mournshard mx-auto mb-4" />
          <h2 className="font-headline text-xl uppercase tracking-wide text-mournshard">
            New Password
          </h2>
          <p className="text-text-muted text-sm mt-2">
            Choose a new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-steel border border-steel-light rounded text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-mournshard"
            />
          </div>
          
          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-steel border border-steel-light rounded text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-mournshard"
            />
          </div>

          {error && (
            <p className="text-sm text-shadow">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="forge-button bg-mournshard text-void hover:bg-ember w-full py-3"
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-text-muted text-sm hover:text-mournshard">
            Back to The Forge
          </a>
        </div>
      </motion.div>
    </div>
  );
};