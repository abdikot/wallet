'use client';

import { Transaction } from "@/db/db";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => Promise<boolean>;
  showLatestOnly?: boolean;
}

export default function TransactionList({
  transactions,
  onDelete,
  showLatestOnly = false
}: TransactionListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Filter transactions
  let filteredTransactions = transactions;
  if (filterType === 'income') {
    filteredTransactions = transactions.filter(t => t.type === 'income');
  } else if (filterType === 'expense') {
    filteredTransactions = transactions.filter(t => t.type === 'expense');
  }

  // Apply latest only filter if needed
  const displayTransactions = showLatestOnly
    ? filteredTransactions.slice(0, 5)
    : filteredTransactions;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      food: '🍔',
      transportation: '🚗',
      bills: '📝',
      entertainment: '🎬',
      shopping: '🛍️',
      health: '💊',
      salary: '💰',
      bonus: '🎁',
      gift: '🎀',
      investment: '📈',
      other_income: '💸',
      other_expense: '📦'
    };

    return emojis[category] || '📋';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      food: 'Makanan',
      transportation: 'Transportasi',
      bills: 'Tagihan',
      entertainment: 'Hiburan',
      shopping: 'Belanja',
      health: 'Kesehatan',
      salary: 'Gaji',
      bonus: 'Bonus',
      gift: 'Hadiah',
      investment: 'Investasi',
      other_income: 'Pemasukan Lain',
      other_expense: 'Pengeluaran Lain'
    };

    return labels[category] || category.replace('_', ' ');
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      const success = await onDelete(id);
      if (success) {
        setDeleteConfirm(null);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const calculateTotal = () => {
    return displayTransactions.reduce((total, transaction) => {
      if (transaction.type === 'income') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  };

  const getTransactionTypeColor = (type: 'income' | 'expense') => {
    return type === 'income' ? 'bg-green-50' : 'bg-red-50';
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hari ini';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return format(date, 'dd MMMM yyyy', { locale: id });
    }
  };

  if (displayTransactions.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📋</span>
        </div>
        <p className="text-gray-500 mb-2">Belum ada transaksi</p>
        <p className="text-gray-400 text-sm">
          {!showLatestOnly && 'Tambahkan transaksi pertama Anda untuk melihat daftar di sini.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {!showLatestOnly && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Daftar Transaksi</h3>
            <div className="text-sm font-medium text-gray-700">
              Total: <span className={calculateTotal() >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === 'income' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pemasukan
            </button>
            <button 
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === 'expense' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pengeluaran
            </button>
          </div>
        </div>
      )}

      <ul className="space-y-3">
        <AnimatePresence>
          {displayTransactions.map(transaction => (
            <motion.li
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden', margin: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <motion.div 
                className={`p-3 rounded-xl shadow-sm ${getTransactionTypeColor(transaction.type)} ${
                  expandedId === transaction.id ? '' : 'hover:shadow-md'
                } transition-all duration-200`}
                whileHover={{ scale: expandedId === transaction.id ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedId(expandedId === transaction.id ? null : transaction.id ?? null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-200' : 'bg-red-200'
                    }`}>
                      <span className="text-2xl" role="img" aria-label={transaction.category}>
                        {getCategoryEmoji(transaction.category)}
                      </span>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-800">
                        {getCategoryLabel(transaction.category)}
                      </p>
                      {transaction.note && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {transaction.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getFormattedDate(transaction.date)}
                    </p>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedId === transaction.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-gray-500">Kategori:</div>
                        <div className="text-gray-800 font-medium flex items-center">
                          <span className="mr-2">{getCategoryEmoji(transaction.category)}</span>
                          {getCategoryLabel(transaction.category)}
                        </div>

                        <div className="text-gray-500">Tanggal:</div>
                        <div className="text-gray-800">
                          {format(new Date(transaction.date), 'EEEE, dd MMMM yyyy', { locale: id })}
                        </div>

                        <div className="text-gray-500">Jenis:</div>
                        <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </div>

                        <div className="text-gray-500">Jumlah:</div>
                        <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>

                      {transaction.note && (
                        <div className="mb-4">
                          <div className="text-gray-500 text-sm mb-1">Catatan:</div>
                          <div className="bg-white p-2 rounded-md text-gray-800 text-sm">
                            {transaction.note}
                          </div>
                        </div>
                      )}

                      {!showLatestOnly && (
                        <div className="flex justify-end mt-2">
                          {deleteConfirm === transaction.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(null);
                                }}
                                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                              >
                                Batal
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (transaction.id) handleDelete(transaction.id);
                                }}
                                disabled={isDeleting === transaction.id}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                              >
                                {isDeleting === transaction.id ? 'Menghapus...' : 'Hapus'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(transaction.id ?? null);
                              }}
                              className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Hapus Transaksi
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {!showLatestOnly && filteredTransactions.length > displayTransactions.length && (
        <div className="mt-4 text-center">
          <button 
            className="px-4 py-2 text-blue-600 font-medium text-sm rounded-md hover:bg-blue-50"
          >
            Muat lebih banyak
          </button>
        </div>
      )}
      
      {!showLatestOnly && displayTransactions.length > 0 && (
        <div className="mt-6 text-center text-gray-500 text-xs">
          Menampilkan {displayTransactions.length} dari {filteredTransactions.length} transaksi
        </div>
      )}
    </div>
  );
}