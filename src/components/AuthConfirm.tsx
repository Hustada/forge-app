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
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (error || errorCode) {
      setStatus('error');
      // Decode the error description and make it more user-friendly
      const decodedError = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : 'Confirmation failed';
      
      if (errorCode === 'otp_expired') {
        setMessage('This confirmation link has expired. Please sign up again to receive a new link.');
      } else {
        setMessage(decodedError);
      }
    } else if (accessToken || type === 'signup' || window.location.hash.includes('type=signup')) {
      setStatus('success');
      setMessage('Email confirmed! Signing you in...');
      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      // No recognized parameters, show generic error
      setStatus('error');
      setMessage('Invalid confirmation link.');
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
            <p className="text-xs text-text-muted mt-4">Redirecting...</p>
          </>
        ) : (
          <>
            <XCircle className="w-12 h-12 text-shadow mx-auto mb-4" />
            <h2 className="font-headline text-xl uppercase tracking-wide text-shadow mb-2">
              Link Expired
            </h2>
            <p className="text-text-muted mb-6">{message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="forge-button bg-mournshard text-void hover:bg-ember px-6 py-2"
            >
              Back to The Forge
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};