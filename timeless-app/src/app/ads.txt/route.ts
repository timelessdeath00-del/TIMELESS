import { NextResponse } from 'next/server';

export async function GET() {
  const adsTxt =
    process.env.NEXT_PUBLIC_ADS_TXT ||
    'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n# Timeless Games Authorized Digital Sellers';

  return new NextResponse(adsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
