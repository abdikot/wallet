'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getAllTransactions, 
  addTransaction, 
  deleteTransaction,
  getTransactionsByMonth,
  Transaction 
} from '@/db/db';

export default function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ambil semua transaksi
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Gagal mengambil transaksi: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Ambil transaksi berdasarkan bulan
  const fetchTransactionsByMonth = useCallback(async (year: number, month: number) => {
    try {
      setLoading(true);
      const data = await getTransactionsByMonth(year, month);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Gagal mengambil transaksi: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Tambah transaksi baru
  const createTransaction = async (newTransaction: Transaction) => {
    try {
      await addTransaction(newTransaction);
      await fetchTransactions(); // Refresh list
      return true;
    } catch (err) {
      setError('Gagal menambahkan transaksi: ' + (err as Error).message);
      return false;
    }
  };
  
  // Hapus transaksi
  const removeTransaction = async (id: number) => {
    try {
      await deleteTransaction(id);
      await fetchTransactions(); // Refresh list
      return true;
    } catch (err) {
      setError('Gagal menghapus transaksi: ' + (err as Error).message);
      return false;
    }
  };
  
  // Hitung total saldo
  const calculateBalance = () => {
    return transactions.reduce((sum, item) => {
      if (item.type === 'income') {
        return sum + item.amount;
      } else {
        return sum - item.amount;
      }
    }, 0);
  };
  
  // Hitung total pemasukan
  const calculateIncome = () => {
    return transactions
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
  };
  
  // Hitung total pengeluaran
  const calculateExpense = () => {
    return transactions
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
  };
  
  // Load transaksi saat komponen dimuat
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  return {
    transactions,
    loading,
    error,
    createTransaction,
    removeTransaction,
    calculateBalance,
    calculateIncome,
    calculateExpense,
    fetchTransactions,
    fetchTransactionsByMonth
  };
}