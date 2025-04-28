'use client';

import { Transaction } from "@/db/db";
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => Promise<boolean>;
  showLatestOnly?: boolean
}

export default function TransactionList({
  transactions,
  onDelete,
  showLatestOnly = false
}: TransactionListProps) {

  const displayTransactions = showLatestOnly
    ? transactions.slice(0, 5)
    : transactions

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
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
    }

    return emojis[category] || '📋'
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      await onDelete(id)
    }
  };

  if (displayTransactions.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Belum ada transaksi. {!showLatestOnly && 'Tambahkan transaksi pertama anda.'}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      <AnimatePresence>
        {displayTransactions.map(transaction => (
          <motion.li
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="py-3 transition-transform duration-200 ease-in-out hover:scale-[1.02] active:scale-95 hover:shadow-lg rounded-lg px-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <span className="text-2xl mr-3">
                  {getCategoryEmoji(transaction.category)}
                </span>
                <div>
                  <p className="text-sm text-gray-600 capitalize">
                    {transaction.category.replace('_', '')}
                  </p>
                  <p className="text-gray-900">
                    {transaction.note || 'Tanpa Catatan'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(transaction.date), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>

                {!showLatestOnly && (
                  <button
                    onClick={() => transaction.id && handleDelete(transaction.id)}
                    className="text-gray-400 hover:text-red-600 text-sm mt-1"
                    aria-label="Hapus Transaksi"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
