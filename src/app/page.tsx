'use client';

import { useEffect } from "react";
import useTransactions from "@/hooks/useTransactions";
import TransactionList from "@/components/TransactionList";

export default function Dashboard() {
  const {
    transactions,
    loading,
    calculateBalance,
    calculateIncome,
    calculateExpense,
    removeTransaction,
    fetchTransactions
  } = useTransactions();

  //Memastikan data ter-refresh saat halaman dibuka
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="px-4 pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center text-blue-600">My Wallet</h1>
      </div>

      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4 mb-4 text-center">
        <h2 className="text-lg font-medium mb-1">Saldo Total</h2>
        <p className="text-3xl font-bold">
          {loading ? 'Memuat...' : formatCurrency(calculateBalance())}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-3 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600">Pemasukan</h3>
          <p className="text-xl font-semibold text-gray-800">
            {loading ? 'Memuat...' : formatCurrency(calculateIncome())}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-600">Pengeluaran</h3>
          <p className="text-xl font-semibold text-gray-800">
            {loading ? 'Memuat...' : formatCurrency(calculateExpense())}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg text-gray-600 font-semibold">Transaksi Terbaru</h3>
          {transactions.length > 5 && (
            <a href="/transactions" className="text-blue-600 text-sm">
              Lihat Semua
            </a>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Memuat Data Transaksi...</div>
        ) : (
          <TransactionList
            transactions={transactions}
            onDelete={removeTransaction}
            showLatestOnly={true}
          />
        )}
      </div>
      <div className="fixed bottom-20 inset-x-0 mx-4 bg-gray-800 text-white p-3 rounded-lg opacity-80 hidden" id="pwa-install-banner">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">Instal MyWallet di perangkat Anda</p>
          </div>
          <div className="flex space-x-2">
            <button id="pwa-install-button" className="text-xs bg-blue-600 px-3 py-1 rounded">
              Instal
            </button>
            <button id="pwa-dismiss-button" className="text-xs">
              ✕
            </button>
          </div>
        </div>
      </div>      
    </div>
  )
}