'use client';

import { useEffect } from "react";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import useTransactions from "@/hooks/useTransactions";

export default function TransactionPage() {
    const {
        transactions,
        loading,
        error,
        createTransaction,
        removeTransaction,
        fetchTransactions
    } = useTransactions();

     // Pastikan data ter-refresh saat halaman dibuka
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <div className="px-4 pt-4 pb-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-center text-gray-800">Transaksi</h1>
            </div>

            <TransactionForm onAddTransaction={createTransaction}/>

            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-gray-800 text-xl font-semibold mb-4">Riwayat Transaksi</h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-8 text-center to-gray-500">Memuat Data Transaksi...</div>
                ) : (
                    <TransactionList
                        transactions={transactions}
                        onDelete={removeTransaction}
                    />
                )}
            </div>
        </div>
    )
}