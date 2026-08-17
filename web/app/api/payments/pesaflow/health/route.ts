import { isPesaflowConfiguredFromEnv } from '@/lib/payments/pesaflow.config';
import { NextResponse } from 'next/server';

export async function GET() {
  const configured = isPesaflowConfiguredFromEnv();

  return NextResponse.json({
    success: true,
    service: 'pesaflow',
    configured,
    message: configured
      ? 'PesaFlow credentials are present.'
      : 'PesaFlow is not configured. Set PESAFLOW_* environment variables.',
  });
}
