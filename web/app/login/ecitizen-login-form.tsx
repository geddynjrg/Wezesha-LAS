'use client';

import { resolveLoginSuccessPath } from '@/lib/auth/return-path';
import { Alert } from '@workspace/ui/components/alert';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export const ECitizenLoginForm = () => {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const adminDomain =
    process.env.NEXT_PUBLIC_ADMIN_DOMAIN ?? 'https://loans-admin.uwezo.go.ke';

  const handleECitizenLogin = () => {
    setIsLoading(true);
    setError('');

    try {
      const callbackUrl = resolveLoginSuccessPath(
        searchParams.get('callbackUrl'),
      );
      const origin = window.location.origin;
      const authUrl = `${adminDomain}/api/oauth/ecitizen/login?origin=${encodeURIComponent(origin)}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
      window.location.href = authUrl;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to start authentication. Please try again.',
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error" className="mb-4">
          <p className="font-medium">Authentication Error</p>
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Secure government authentication via eCitizen
        </p>

        <button
          type="button"
          onClick={handleECitizenLogin}
          disabled={isLoading}
          className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold text-white bg-[#15b14d] rounded-full hover:bg-[#0e7e36] focus:outline-none focus:ring-2 focus:ring-[#15b14d] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Connecting to eCitizen...' : 'Sign in with eCitizen'}
        </button>

        <div className="mt-3 text-xs text-gray-500">
          <p>You will be redirected to the official eCitizen portal.</p>
        </div>
      </div>
    </div>
  );
};
