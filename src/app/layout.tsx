'use client';

import './globals.css';
import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulasi loading pada saat aplikasi pertama kali dibuka
  useEffect(() => {
    // Cek apakah ini pertama kali aplikasi dibuka di sesi ini
    const hasVisited = sessionStorage.getItem('hasVisitedBefore');
    
    if (!hasVisited) {
      // Jika belum pernah dibuka di sesi ini, tunjukkan loading
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('hasVisitedBefore', 'true');
      }, 3000); // Durasi loading 3 detik
      
      return () => clearTimeout(timer);
    } else {
      // Jika sudah pernah dibuka di sesi ini, langsung tampilkan konten
      setIsLoading(false);
    }
  }, []);

  return (
    <html lang="id">
      <head />
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
            <div className="max-w-lg mx-auto pb-48">
              {children}
            </div>
            
            <Navigation />
          </>
        )}
        
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