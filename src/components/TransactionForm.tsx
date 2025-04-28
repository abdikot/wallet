'use client';

import { useState } from 'react';
import { Transaction } from '@/db/db';

interface TransactionFormProps {
    onAddTransaction: (transaction: Transaction) => Promise<boolean>;
}

export default function TransactionForm({onAddTransaction}: TransactionFormProps) {
    const [formData, setFormData] = useState<Transaction>({
        type: 'expense',
        amount: 0,
        category: 'food',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const [isSubmitting , setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
        ...prevState,
        [name]: name === 'amount' ?  (value === '' ? 0 : parseFloat(value)) : value 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!formData.amount || formData.amount <= 0) {
            setMessage({text: 'Jumlah harus lebih dari 0', type: 'error'});
            return;
        }
        setIsSubmitting(true);

        try {
            const success = await onAddTransaction(formData);
            
            if(success) {
                setMessage({text: 'Transaksi berhasil ditambahkan', type: 'success'});
                setFormData({
                    type: 'expense',
                    amount: 0,
                    category: 'food',
                    date: new Date().toISOString().split('T')[0],
                    note: ''
                });
            }else {
                setMessage({text: 'Gagal Menambahkan transaksi', type: 'error'})
            }
        } catch (error) {
            setMessage({text: 'Terjadi Kesalahan: ' + (error as Error).message, type: 'error'})
        } finally {
            setIsSubmitting(false)

            //Menghapus pesan setelah 3 detik
            setTimeout(() => {
                setMessage(null)
            }, 3000)
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-gray-800 text-xl font-semibold mb-4">Tambah Transaksi Baru</h2>

            {message && (
                <div className={`p-3 mb-4 rounded-md ${
                    message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'    
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="type" className='block text-sm font-medium text-gray-700 mb-1'>
                        Jenis Transaksi
                    </label>
                    <select 
                        name="type" 
                        id="type"
                        value={formData.type}
                        onChange={handleChange}
                        className='text-gray-800'
                    >
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="amount" className='block text-sm font-medium text-gray-700 mb-1'>
                        Jumlah (Rp)
                    </label>
                    <input 
                        type="number"
                        id='amount'
                        name='amount'
                        placeholder='Contoh: 50000'
                        value={formData.amount || ''}
                        onChange={handleChange}
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800'
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="category" className='block text-sm font-medium text-gray-700 mb-1'>
                        Kategori
                    </label>
                    <select 
                        name="category" 
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800'
                    >
                        {formData.type === 'income' ? (
                            <>
                            <option value="salary">Gaji</option>
                            <option value="bonus">Bonus</option>
                            <option value="gift">Hadiah</option>
                            <option value="invesment">Investasi</option>
                            <option value="other_income">Lainya</option>
                            </>
                        ) : (
                            <>
                            <option value="food">Makanaan</option>
                            <option value="bills">Tagihan</option>
                            <option value="shopping">Belanja</option>
                            <option value="entertaiment">Hiburan</option>
                            <option value="transportasi">Transportasi</option>
                            <option value="health">Kesehatan</option>
                            <option value="other_expense">Lainya</option>
                            </>
                        )}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="date" className='block text-sm font-medium text-gray-700 mb-1'>
                        Tanggal
                    </label>
                    <input 
                        type="date"
                        id='date'
                        name='date'
                        value={formData.date}
                        onChange={handleChange}
                        className='text-gray-800 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan
                    </label>
                    <textarea
                        id="note"
                        name="note"
                        placeholder="Catatan tambahan..."
                        value={formData.note}
                        onChange={handleChange}
                        className="text-gray-800 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                    ></textarea>
                </div>

                <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition disabled:opacity-50'    
                >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
            </form>
        </div>
    )
}