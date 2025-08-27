import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export const AuthConfirm: React.FC = () => {
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if we're on the confirmation page
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error) {
      setStatus('error');
      setMessage(errorDescription || 'Confirmation failed');
    } else if (window.location.hash.includes('type=signup')) {
      setStatus('success');
      setMessage('Email confirmed! You can now sign in.');
      // Redirect to home after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, []);

  if (status === 'confirming') {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-mournshard">Confirming your email...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="forge-card p-6 w-full max-w-md text-center"
      >
        {status === 'success' ? (
          <>
            <CheckCircle className="w-12 h-12 text-mournshard mx-auto mb-4" />
            <h2 className="font-headline text-xl uppercase tracking-wide text-mournshard mb-2">
              Forged
            </h2>
            <p className="text-text-muted">{message}</p>
          </>
        ) : (
          <>
            <XCircle className="w-12 h-12 text-shadow mx-auto mb-4" />
            <h2 className="font-headline text-xl uppercase tracking-wide text-shadow mb-2">
              Failed
            </h2>
            <p className="text-text-muted">{message}</p>
          </>
        )}
      </motion.div>
    </div>
  );
};