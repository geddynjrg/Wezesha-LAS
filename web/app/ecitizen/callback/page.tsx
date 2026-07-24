'use client';

import { bootstrapEcitizenSessionFromAdmin } from '@/lib/auth/ecitizen-admin-callback';
import { resolveLoginSuccessPath } from '@/lib/auth/return-path';
import {
  IconAlertCircle,
  IconCircleCheckFilled,
  IconLoader2,
} from '@tabler/icons-react';
import { Alert } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ECitizenCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = {
          accessToken: searchParams.get('access_token'),
          refreshToken: searchParams.get('refresh_token'),
          error: searchParams.get('error'),
          errorDescription: searchParams.get('error_description'),
          callbackUrl: searchParams.get('callback_url') || '/dashboard',
          email: searchParams.get('email'),
          name: searchParams.get('name'),
          mobileNumber: searchParams.get('mobile_number'),
          idNumber: searchParams.get('id_number'),
          kraPin: searchParams.get('kra_pin'),
          ecitizenId: searchParams.get('ecitizen_id'),
        };

        const decodedCallback = resolveLoginSuccessPath(
          decodeURIComponent(params.callbackUrl),
        );
        const finalPath = decodedCallback.startsWith('/')
          ? decodedCallback
          : `/${decodedCallback}`;

        if (params.error) {
          throw new Error(
            params.error === 'access_denied'
              ? 'Access denied. Please check your eCitizen credentials.'
              : params.errorDescription || 'Authentication failed',
          );
        }

        if (!params.accessToken) {
          throw new Error('Missing session tokens. Please log in again.');
        }

        const bootstrapResult = await bootstrapEcitizenSessionFromAdmin({
          adminAccessToken: params.accessToken,
          email: params.email,
          name: params.name,
          mobileNumber: params.mobileNumber,
          idNumber: params.idNumber,
          kraPin: params.kraPin,
          ecitizenId: params.ecitizenId,
        });

        if (!bootstrapResult.ok) {
          throw new Error(bootstrapResult.error);
        }

        setStatus('success');
        setMessage('Securely signed in. Taking you to your application...');

        setTimeout(() => router.push(finalPath), 1500);
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : 'Authentication failed',
        );
        setTimeout(() => router.push('/login'), 5000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <Container className="flex min-h-[60vh] items-center justify-center max-w-md">
      <div className="w-full text-center space-y-8">
        {status === 'loading' && (
          <div className="space-y-4">
            <IconLoader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Verifying Identity
              </h1>
              <p className="text-muted-foreground text-sm">
                Finalizing your secure connection with eCitizen...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <IconCircleCheckFilled className="mx-auto h-16 w-16 text-green-500" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <Alert variant="error" className="text-left">
              <IconAlertCircle className="h-5 w-5" />
              <div className="font-semibold">Authentication Error</div>
              <div>{message}</div>
            </Alert>
            <Button onClick={() => router.push('/login')} className="w-full">
              Try Logging In Again
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
}
