'use client';

import { useState, useEffect } from 'react';
import useTransactions from '@/hooks/useTransactions';
import { format, subMonths, addMonths, eachMonthOfInterval, isSameMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { ChartData } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

const DoughnutChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Doughnut),
  { ssr: false }
);

const BarChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false }
);

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function ReportsPage() {
  const { transactions, fetchTransactions, fetchTransactionsByMonth } = useTransactions();
  
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [chartData, setChartData] = useState<ChartData<'doughnut'> | null>(null);
  const [trendChartData, setTrendChartData] = useState<ChartData<'bar'> | null>(null);
  const [categoryTotals, setCategoryTotals] = useState<Array<{
    category: string;
    amount: number;
    percentage: number;
    emoji: string;
  }>>([]);
  const [reportView, setReportView] = useState<'monthly' | 'trends'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [monthsData, setMonthsData] = useState<Array<{
    date: Date;
    income: number;
    expense: number;
    savings: number;
  }>>([]);
  
  // Hitung statistik berdasarkan bulan yang dipilih
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (reportView === 'monthly') {
        await fetchTransactionsByMonth(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1
        );
      } else if (reportView === 'trends') {
        await fetchTransactions(); // Gunakan ini sebagai pengganti getAllTransactions
        prepareMonthlyTrendData();
      }
      setIsLoading(false);
    };
    
    fetchData();
  }, [selectedDate, fetchTransactionsByMonth, reportView, fetchTransactions, ]);
  
  // Persiapkan data chart
  useEffect(() => {
    if (reportView === 'monthly' && transactions.length > 0) {
      prepareChartData();
    } else if (reportView === 'trends') {
      prepareMonthlyTrendData();
    }
  }, [transactions, reportView,]);
  
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

  const prepareChartData = () => {
    // Filter hanya pengeluaran
    const expenses = transactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
      setChartData(null);
      setCategoryTotals([]);
      return;
    }
    
    // Group by category
    const categories: Record<string, number> = {};
    expenses.forEach(expense => {
      if (categories[expense.category]) {
        categories[expense.category] += expense.amount;
      } else {
        categories[expense.category] = expense.amount;
      }
    });
    
    // Prepare for chart
    const labels = Object.keys(categories).map(category => 
      category.replace('_', ' ')
    );
    
    const data = Object.values(categories);
    
    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#8AC24A', '#607D8B', '#E91E63', '#F44336'
    ];
    
    setChartData({
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
          borderColor: 'white'
        }
      ]
    });
    
    // Hitung persentase kategori
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const totals = Object.entries(categories)
      .map(([category, amount]) => ({
        category: category.replace('_', ' '),
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        emoji: getCategoryEmoji(category)
      }))
      .sort((a, b) => b.amount - a.amount);
    
    setCategoryTotals(totals);
  };

  const prepareMonthlyTrendData = () => {
    // Generate last 6 months
    const endDate = new Date();
    const startDate = subMonths(endDate, 5); // Last 6 months
    
    const monthRange = eachMonthOfInterval({ start: startDate, end: endDate });
    
    const monthlyData = monthRange.map(date => {
      // Filter transactions for this month
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return isSameMonth(tDate, date);
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date,
        income,
        expense,
        savings: income - expense
      };
    });
    
    setMonthsData(monthlyData);
    
    // Prepare bar chart data
    const labels = monthlyData.map(d => format(d.date, 'MMM', { locale: id }));
    
    setTrendChartData({
      labels,
      datasets: [
        {
          label: 'Pemasukan',
          data: monthlyData.map(d => d.income),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        },
        {
          label: 'Pengeluaran',
          data: monthlyData.map(d => d.expense),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const handlePreviousMonth = () => {
    setSelectedDate(prev => subMonths(prev, 1));
  };
  
  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedDate, 1);
    if (nextMonth <= new Date()) {
      setSelectedDate(nextMonth);
    }
  };
  
  // Calculate month totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netSavings = totalIncome - totalExpense;
  
  const getSavingsRate = () => {
    if (totalIncome === 0) return 0;
    return (netSavings / totalIncome) * 100;
  };

  const savingsRate = getSavingsRate();
  
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 pt-8 pb-16 rounded-b-3xl shadow-lg mb-4">
        <h1 className="text-2xl font-bold text-center mb-4">Laporan Keuangan</h1>
        
        {/* Report Type Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-1 rounded-full">
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                reportView === 'monthly' 
                  ? 'bg-white text-blue-700' 
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setReportView('monthly')}
            >
              Bulanan
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                reportView === 'trends' 
                  ? 'bg-white text-blue-700' 
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setReportView('trends')}
            >
              Tren
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4">
        <AnimatePresence mode="wait">
          {reportView === 'monthly' ? (
            <motion.div 
              key="monthly"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Month Selector */}
              <div className="flex justify-center items-center -mt-12 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-1 flex items-center">
                  <button 
                    onClick={handlePreviousMonth}
                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-l-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="px-4 py-2 font-medium text-gray-800">
                    {format(selectedDate, 'MMMM yyyy', { locale: id })}
                  </div>
                  
                  <button 
                    onClick={handleNextMonth}
                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:hover:bg-white"
                    disabled={addMonths(selectedDate, 1) > new Date()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-4 relative overflow-hidden"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full -mr-6 -mt-6 flex items-end justify-start pb-1 pl-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-500">
                      <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm5.25-9.25a.75.75 0 00-1.5 0v4.59l-1.95-2.1a.75.75 0 10-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V7.75z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Pemasukan</h3>
                  <p className="text-lg font-bold text-green-600">
                    {isLoading ? '...' : formatCurrency(totalIncome)}
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-4 relative overflow-hidden"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full -mr-6 -mt-6 flex items-end justify-start pb-1 pl-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500">
                      <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Pengeluaran</h3>
                  <p className="text-lg font-bold text-red-600">
                    {isLoading ? '...' : formatCurrency(totalExpense)}
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-4 relative overflow-hidden"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full -mr-6 -mt-6 flex items-end justify-start pb-1 pl-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-500">
                      <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 00-1.5 0v.784a.272.272 0 01-.35.25A49.043 49.043 0 001.75 14.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Sisa</h3>
                  <p className={`text-lg font-bold ${netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {isLoading ? '...' : formatCurrency(netSavings)}
                  </p>
                </motion.div>
              </div>
              
              {/* Savings Rate Card */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base font-medium text-gray-800">Tingkat Tabungan</h2>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    savingsRate >= 20 ? 'bg-green-100 text-green-700' : 
                    savingsRate >= 0 ? 'bg-blue-100 text-blue-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {savingsRate.toFixed(0)}%
                  </span>
                </div>
                
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${
                      savingsRate >= 20 ? 'bg-green-500' : 
                      savingsRate >= 0 ? 'bg-blue-500' : 
                      'bg-red-500'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.max(0, Math.min(100, savingsRate + 20))}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  ></motion.div>
                </div>
                
                <div className="mt-2 text-xs flex justify-between text-gray-500">
                  <span>Target: 20%</span>
                  <span>
                    {savingsRate >= 20 ? 'Sangat Baik' : 
                     savingsRate >= 10 ? 'Baik' : 
                     savingsRate >= 0 ? 'Cukup' : 
                     'Perlu Perhatian'}
                  </span>
                </div>
              </div>
              
              {/* Chart Container */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Pengeluaran per Kategori</h2>
                
                {isLoading ? (
                  <div className="py-16 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : chartData ? (
                  <div className="max-w-xs mx-auto">
                    <DoughnutChart 
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              padding: 15,
                              font: {
                                size: 11
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${formatCurrency(value)}`;
                              }
                            }
                          }
                        },
                        cutout: '70%'
                      }}
                    />
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-gray-400">
                        <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-1">Tidak ada data pengeluaran</p>
                    <p className="text-sm text-gray-400">Belum ada transaksi pengeluaran untuk bulan ini</p>
                  </div>
                )}
              </div>
              
              {/* Category Breakdown */}
              {!isLoading && categoryTotals.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Rincian Kategori</h2>
                  
                  <div>
                    {categoryTotals.map(({ category, amount, percentage, emoji }) => (
                      <div key={category} className="mb-3 last:mb-0">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className="w-8 h-8 flex items-center justify-center text-lg bg-gray-100 rounded-lg mr-2">
                              {emoji}
                            </span>
                            <span className="font-medium text-gray-800 capitalize">{category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{formatCurrency(amount)}</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          ></motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-gray-800">
                      <span className="font-medium">Total Pengeluaran</span>
                      <span className="font-bold text-red-600">{formatCurrency(totalExpense)}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 -mt-12">
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Tren 6 Bulan Terakhir</h2>
                  
                  {isLoading ? (
                    <div className="py-16 flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  ) : trendChartData ? (
                    <div className="h-64">
                      <BarChart
                        data={trendChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.dataset.label || '';
                                  const value = context.parsed.y;
                                  return `${label}: ${formatCurrency(value)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return formatCurrency(Number(value));
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-gray-500">Data tidak tersedia</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Monthly Comparison */}
              {!isLoading && monthsData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Perbandingan Bulanan</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium text-gray-600">Bulan</th>
                          <th className="text-right py-2 px-2 font-medium text-gray-600">Pemasukan</th>
                          <th className="text-right py-2 px-2 font-medium text-gray-600">Pengeluaran</th>
                          <th className="text-right py-2 px-2 font-medium text-gray-600">Tabungan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthsData.map((monthData, index) => (
                          <tr 
                            key={index} 
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              index === monthsData.length - 1 ? 'font-medium' : ''
                            }`}
                          >
                            <td className="py-3 px-2">
                              {format(monthData.date, 'MMMM yyyy', { locale: id })}
                              {index === monthsData.length - 1 && 
                                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                  Sekarang
                                </span>
                              }
                            </td>
                            <td className="py-3 px-2 text-right text-green-600">
                              {formatCurrency(monthData.income)}
                              </td>
                            <td className="py-3 px-2 text-right text-red-600">
                              {formatCurrency(monthData.expense)}
                            </td>
                            <td className={`py-3 px-2 text-right ${
                              monthData.savings >= 0 ? 'text-blue-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(monthData.savings)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Savings Trend */}
              {!isLoading && monthsData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Tren Tabungan</h2>
                  
                  <div className="space-y-3">
                    {monthsData.map((monthData, index) => {
                      const savingRate = monthData.income > 0 
                        ? (monthData.savings / monthData.income) * 100
                        : 0;
                      
                      return (
                        <div key={index} className="flex items-center">
                          <div className="w-28 text-sm">
                            {format(monthData.date, 'MMM yyyy', { locale: id })}
                          </div>
                          <div className="flex-grow h-5 bg-gray-100 rounded-full overflow-hidden relative">
                            <motion.div 
                              className={`h-full rounded-full ${
                                monthData.savings >= 0 ? 'bg-blue-500' : 'bg-red-500'
                              }`}
                              initial={{ width: '0%' }}
                              animate={{ width: `${Math.max(0, Math.min(100, savingRate + 20))}%` }}
                              transition={{ duration: 0.8, delay: 0.1 * index }}
                            ></motion.div>
                            <div className={`absolute right-2 top-0 bottom-0 flex items-center text-xs font-medium ${
                              monthData.savings >= 0 ? 'text-blue-800' : 'text-white'
                            }`}>
                              {savingRate.toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 pt-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>0%</span>
                      <span>Target: 20%</span>
                      <span>40%</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Advice card */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border-l-4 border-blue-500">
                <div className="flex">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Tips Keuangan</h3>
                    <p className="text-sm text-gray-600">
                      {netSavings < 0 
                        ? "Pengeluaran Anda melebihi pemasukan. Pertimbangkan untuk melacak pengeluaran lebih detail dan identifikasi area penghematan."
                        : savingsRate < 10 
                        ? "Tabungan Anda kurang dari 10%. Coba tingkatkan dengan mengurangi pengeluaran non-esensial."
                        : savingsRate < 20
                        ? "Anda berada di jalur yang baik! Pertimbangkan untuk meningkatkan tabungan hingga mencapai 20% dari pendapatan."
                        : "Hebat! Anda menabung lebih dari 20% dari pendapatan. Pertimbangkan untuk menginvestasikan sebagian dari tabungan Anda."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}