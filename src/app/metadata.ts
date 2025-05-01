import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MyWallet - Aplikasi Pencatatan Keuangan',
  description: 'Aplikasi pencatatan keuangan pribadi untuk iOS dan laptop',
  manifest: '/manifest.json',
  themeColor: '#4A90E2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyWallet',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};