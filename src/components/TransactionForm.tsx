'use client';

import { useState, useEffect } from 'react';
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
    const [formattedAmount, setFormattedAmount] = useState('');
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // Format amount as currency
    useEffect(() => {
        if (formData.amount) {
            const formatted = new Intl.NumberFormat('id-ID').format(formData.amount);
            setFormattedAmount(formatted);
        } else {
            setFormattedAmount('');
        }
    }, [formData.amount]);

    const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        const numericValue = value === '' ? 0 : parseInt(value, 10);
        
        setFormData(prev => ({
            ...prev,
            amount: numericValue
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'type' && value !== formData.type) {
            // Reset category when changing transaction type
            const defaultCategory = value === 'income' ? 'salary' : 'food';
            setFormData(prev => ({
                ...prev,
                type: value as 'income' | 'expense',
                category: defaultCategory
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: name === 'amount' ? (value === '' ? 0 : parseFloat(value)) : value 
            }));
        }
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
                setShowSuccess(true);
                setMessage({text: 'Transaksi berhasil ditambahkan', type: 'success'});
                
                // Reset form after showing success animation
                setTimeout(() => {
                    setFormData({
                        type: 'expense',
                        amount: 0,
                        category: 'food',
                        date: new Date().toISOString().split('T')[0],
                        note: ''
                    });
                    setFormattedAmount('');
                    setStep(1);
                    setShowSuccess(false);
                }, 2000);
            } else {
                setMessage({text: 'Gagal menambahkan transaksi', type: 'error'})
            }
        } catch (error) {
            setMessage({text: 'Terjadi kesalahan: ' + (error as Error).message, type: 'error'})
        } finally {
            setIsSubmitting(false)

            // Menghapus pesan setelah 3 detik
            setTimeout(() => {
                setMessage(null)
            }, 3000)
        }
    };

    const nextStep = () => {
        if (step === 1 && (!formData.amount || formData.amount <= 0)) {
            setMessage({text: 'Jumlah harus lebih dari 0', type: 'error'});
            return;
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    // UI rendering for success state
    if (showSuccess) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 transition-all duration-500 flex flex-col items-center justify-center min-h-[300px]">
                <div className="success-checkmark">
                    <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                    </div>
                </div>
                <p className="text-green-600 text-lg font-medium mt-4">Transaksi Berhasil Ditambahkan!</p>
                <style jsx>{`
                    .success-checkmark {
                        width: 80px;
                        height: 80px;
                        margin: 0 auto;
                    }
                    .check-icon {
                        width: 80px;
                        height: 80px;
                        position: relative;
                        border-radius: 50%;
                        box-sizing: content-box;
                        border: 4px solid #4CAF50;
                    }
                    .check-icon::before {
                        top: 3px;
                        left: -2px;
                        width: 30px;
                        transform-origin: 100% 50%;
                        border-radius: 100px 0 0 100px;
                    }
                    .check-icon::after {
                        top: 0;
                        left: 30px;
                        width: 60px;
                        transform-origin: 0 50%;
                        border-radius: 0 100px 100px 0;
                        animation: rotate-circle 4.25s ease-in;
                    }
                    .check-icon::before, .check-icon::after {
                        content: '';
                        height: 100px;
                        position: absolute;
                        background: #FFFFFF;
                        transform: rotate(-45deg);
                    }
                    .check-icon .icon-line {
                        height: 5px;
                        background-color: #4CAF50;
                        display: block;
                        border-radius: 2px;
                        position: absolute;
                        z-index: 10;
                    }
                    .check-icon .icon-line.line-tip {
                        top: 46px;
                        left: 14px;
                        width: 25px;
                        transform: rotate(45deg);
                        animation: icon-line-tip 0.75s;
                    }
                    .check-icon .icon-line.line-long {
                        top: 38px;
                        right: 8px;
                        width: 47px;
                        transform: rotate(-45deg);
                        animation: icon-line-long 0.75s;
                    }
                    .check-icon .icon-circle {
                        top: -4px;
                        left: -4px;
                        z-index: 10;
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        position: absolute;
                        box-sizing: content-box;
                        border: 4px solid rgba(76, 175, 80, 0.5);
                    }
                    .check-icon .icon-fix {
                        top: 8px;
                        width: 5px;
                        left: 26px;
                        z-index: 1;
                        height: 85px;
                        position: absolute;
                        transform: rotate(-45deg);
                        background-color: #FFFFFF;
                    }
                    @keyframes rotate-circle {
                        0% { transform: rotate(-45deg); }
                        5% { transform: rotate(-45deg); }
                        12% { transform: rotate(-405deg); }
                        100% { transform: rotate(-405deg); }
                    }
                    @keyframes icon-line-tip {
                        0% { width: 0; left: 1px; top: 19px; }
                        54% { width: 0; left: 1px; top: 19px; }
                        70% { width: 50px; left: -8px; top: 37px; }
                        84% { width: 17px; left: 21px; top: 48px; }
                        100% { width: 25px; left: 14px; top: 46px; }
                    }
                    @keyframes icon-line-long {
                        0% { width: 0; right: 46px; top: 54px; }
                        65% { width: 0; right: 46px; top: 54px; }
                        84% { width: 55px; right: 0px; top: 35px; }
                        100% { width: 47px; right: 8px; top: 38px; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 transition-all duration-300">
            <h2 className="text-gray-800 text-xl font-semibold mb-4">Tambah Transaksi Baru</h2>

            {message && (
                <div className={`p-3 mb-4 rounded-md ${
                    message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'    
                } animate-fadeIn`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Step Header - Menunjukkan step saat ini */}
                <div className="mb-4 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-500">
                        {step === 1 ? 'Informasi Dasar' : step === 2 ? 'Detail Transaksi' : 'Catatan & Ringkasan'}
                    </div>
                    <div className="text-xs text-gray-400">
                        Langkah {step}/3
                    </div>
                </div>

                {/* Step 1: Transaction Type and Amount */}
                <div className={`transition-all duration-300 ${step === 1 ? 'block' : 'hidden'}`}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jenis Transaksi
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label 
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    formData.type === 'expense' 
                                    ? 'border-red-500 bg-red-50 text-red-700' 
                                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                                }`}
                            >
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="expense" 
                                    checked={formData.type === 'expense'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                <span className="text-sm font-medium">Pengeluaran</span>
                            </label>

                            <label 
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    formData.type === 'income' 
                                    ? 'border-green-500 bg-green-50 text-green-700' 
                                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                                }`}
                            >
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="income" 
                                    checked={formData.type === 'income'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                <span className="text-sm font-medium">Pemasukan</span>
                            </label>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                            Jumlah
                        </label>
                        <div className={`relative mt-1 rounded-md shadow-sm ${
                            formData.type === 'income' ? 'focus-within:ring-green-500 focus-within:border-green-500' : 
                            'focus-within:ring-red-500 focus-within:border-red-500'
                        }`}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className={`text-gray-500 sm:text-sm ${formData.amount > 0 ? 'opacity-100' : 'opacity-50'}`}>
                                    Rp
                                </span>
                            </div>
                            <input
                                type="text"
                                id="amount"
                                name="amount"
                                value={formattedAmount}
                                onChange={handleNumericInput}
                                className={`block w-full pl-10 pr-12 py-3 text-lg border-gray-300 rounded-md focus:outline-none ${
                                    formData.type === 'income' 
                                    ? 'focus:ring-green-500 focus:border-green-500 text-green-700' 
                                    : 'focus:ring-red-500 focus:border-red-500 text-red-700'
                                }`}
                                placeholder="0"
                                inputMode="numeric"
                                aria-describedby="price-currency"
                            />
                        </div>
                    </div>

                    {/* Form catatan pada step 1 */}
                    <div className="mb-6">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Catatan (Opsional)
                        </label>
                        <textarea
                            id="note"
                            name="note"
                            placeholder="Catatan tambahan..."
                            value={formData.note}
                            onChange={handleChange}
                            className="text-gray-800 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                        ></textarea>
                    </div>
                </div>

                {/* Step 2: Category and Date */}
                <div className={`transition-all duration-300 ${step === 2 ? 'block' : 'hidden'}`}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {formData.type === 'income' ? (
                                <>
                                    <CategoryButton 
                                        id="salary" 
                                        icon="💰" 
                                        label="Gaji" 
                                        selected={formData.category === 'salary'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'salary'}))}
                                    />
                                    <CategoryButton 
                                        id="bonus" 
                                        icon="🎁" 
                                        label="Bonus" 
                                        selected={formData.category === 'bonus'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'bonus'}))}
                                    />
                                    <CategoryButton 
                                        id="gift" 
                                        icon="🎉" 
                                        label="Hadiah" 
                                        selected={formData.category === 'gift'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'gift'}))}
                                    />
                                    <CategoryButton 
                                        id="investment" 
                                        icon="📈" 
                                        label="Investasi" 
                                        selected={formData.category === 'investment'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'investment'}))}
                                    />
                                    <CategoryButton 
                                        id="other_income" 
                                        icon="🔖" 
                                        label="Lainnya" 
                                        selected={formData.category === 'other_income'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'other_income'}))}
                                    />
                                </>
                            ) : (
                                <>
                                    <CategoryButton 
                                        id="food" 
                                        icon="🍔" 
                                        label="Makanan" 
                                        selected={formData.category === 'food'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'food'}))}
                                    />
                                    <CategoryButton 
                                        id="bills" 
                                        icon="📑" 
                                        label="Tagihan" 
                                        selected={formData.category === 'bills'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'bills'}))}
                                    />
                                    <CategoryButton 
                                        id="shopping" 
                                        icon="🛍️" 
                                        label="Belanja" 
                                        selected={formData.category === 'shopping'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'shopping'}))}
                                    />
                                    <CategoryButton 
                                        id="entertainment" 
                                        icon="🎮" 
                                        label="Hiburan" 
                                        selected={formData.category === 'entertainment'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'entertainment'}))}
                                    />
                                    <CategoryButton 
                                        id="transportation" 
                                        icon="🚗" 
                                        label="Transport" 
                                        selected={formData.category === 'transportation'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'transportation'}))}
                                    />
                                    <CategoryButton 
                                        id="health" 
                                        icon="💊" 
                                        label="Kesehatan" 
                                        selected={formData.category === 'health'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'health'}))}
                                    />
                                    <CategoryButton 
                                        id="other_expense" 
                                        icon="🔖" 
                                        label="Lainnya" 
                                        selected={formData.category === 'other_expense'} 
                                        onClick={() => setFormData(prev => ({...prev, category: 'other_expense'}))}
                                    />
                                </>
                            )}
                        </div>
                        
                        {/* Hidden select for form submission */}
                        <select 
                            name="category" 
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="hidden"
                        >
                            {formData.type === 'income' ? (
                                <>
                                    <option value="salary">Gaji</option>
                                    <option value="bonus">Bonus</option>
                                    <option value="gift">Hadiah</option>
                                    <option value="investment">Investasi</option>
                                    <option value="other_income">Lainnya</option>
                                </>
                            ) : (
                                <>
                                    <option value="food">Makanan</option>
                                    <option value="bills">Tagihan</option>
                                    <option value="shopping">Belanja</option>
                                    <option value="entertainment">Hiburan</option>
                                    <option value="transportation">Transportasi</option>
                                    <option value="health">Kesehatan</option>
                                    <option value="other_expense">Lainnya</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Tanggal
                        </label>
                        <input 
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="text-gray-800 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Form catatan juga ditampilkan di step 2 */}
                    <div className="mb-6">
                        <label htmlFor="note2" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Catatan (Opsional)
                        </label>
                        <textarea
                            id="note2"
                            name="note"
                            placeholder="Catatan tambahan..."
                            value={formData.note}
                            onChange={handleChange}
                            className="text-gray-800 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                        ></textarea>
                    </div>
                </div>

                {/* Step 3: Ringkasan */}
                <div className={`transition-all duration-300 ${step === 3 ? 'block' : 'hidden'}`}>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                        <h3 className="text-gray-700 font-medium mb-3">Ringkasan Transaksi</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-500">Jenis:</div>
                            <div className={`font-medium ${formData.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {formData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                            </div>
                            
                            <div className="text-gray-500">Jumlah:</div>
                            <div className="font-medium">
                                Rp {formattedAmount}
                            </div>
                            
                            <div className="text-gray-500">Kategori:</div>
                            <div className="font-medium capitalize">
                                {formData.category.replace('_', ' ')}
                            </div>
                            
                            <div className="text-gray-500">Tanggal:</div>
                            <div className="font-medium">
                                {new Date(formData.date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>

                            <div className="text-gray-500">Catatan:</div>
                            <div className="font-medium">
                                {formData.note ? formData.note : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Tambahkan atau edit catatan di step terakhir */}
                    <div className="mb-6">
                        <label htmlFor="note3" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Edit Catatan (Opsional)
                        </label>
                        <textarea
                            id="note3"
                            name="note"
                            placeholder="Catatan tambahan..."
                            value={formData.note}
                            onChange={handleChange}
                            className="text-gray-800 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                        ></textarea>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    {step > 1 ? (
                        <button 
                            type="button" 
                            onClick={prevStep}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            Kembali
                        </button>
                    ) : (
                        <div></div> // Empty div for spacing
                    )}
                    
                    {step < 3 ? (
                        <button 
                            type="button" 
                            onClick={nextStep}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Selanjutnya
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:hover:bg-green-500"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    )}
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    </div>
                </div>
            </form>
        </div>
    );
}

// Helper component for category buttons
function CategoryButton({ id, icon, label, selected, onClick }: { 
    id: string, 
    icon: string, 
    label: string, 
    selected: boolean, 
    onClick: () => void 
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                selected 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
        >
            <span className="text-2xl mb-1">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
}