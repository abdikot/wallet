import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation'; 

export const metadata: Metadata = {
  title: 'MyWallet - Aplikasi Pencatatan Keuangan',
  description: 'Aplikasi pencatatan keuangan pribadi untuk iOS dan laptop',
  manifest: '/manifest.json',
  themeColor: '#4A90E2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyWallet'
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head />
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <div className="max-w-lg mx-auto pb-48">
          {children}
        </div>
        
        <Navigation />
        
        {/* Script untuk register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('Service Worker registered', reg))
                    .catch(err => console.log('Service Worker registration failed', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}