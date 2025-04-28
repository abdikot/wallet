'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
      <Link 
        href="/" 
        className={`flex flex-col items-center p-2 ${
          pathname === '/' ? 'text-blue-600 font-semibold' : 'text-gray-600'
        }`}
      >
        <span className="text-xl">📊</span>
        <span className="text-xs mt-1">Dashboard</span>
      </Link>
      
      <Link 
        href="/transactions" 
        className={`flex flex-col items-center p-2 ${
          pathname === '/transactions' ? 'text-blue-600 font-semibold' : 'text-gray-600'
        }`}
      >
        <span className="text-xl">📝</span>
        <span className="text-xs mt-1">Transaksi</span>
      </Link>
      
      <Link 
        href="/reports" 
        className={`flex flex-col items-center p-2 ${
          pathname === '/reports' ? 'text-blue-600 font-semibold' : 'text-gray-600'
        }`}
      >
        <span className="text-xl">📈</span>
        <span className="text-xs mt-1">Laporan</span>
      </Link>
    </nav>
  );
}