'use client';

import { useState, useEffect } from 'react';
import useTransactions from '@/hooks/useTransactions';
import { format, subMonths, addMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import dynamic from 'next/dynamic';

// Import Chart.js dinamis agar tidak menyebabkan error SSR
const DoughnutChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Doughnut),
  { ssr: false }
);

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const { transactions, fetchTransactionsByMonth } = useTransactions();
  
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [chartData, setChartData] = useState<any>(null);
  const [categoryTotals, setCategoryTotals] = useState<Array<{
    category: string;
    amount: number;
    percentage: number;
  }>>([]);
  
  // Hitung statistik berdasarkan bulan yang dipilih
  useEffect(() => {
    const fetchData = async () => {
      await fetchTransactionsByMonth(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1
      );
    };
    
    fetchData();
  }, [selectedDate, fetchTransactionsByMonth]);
  
  // Persiapkan data chart
  useEffect(() => {
    if (transactions.length > 0) {
      prepareChartData();
    }
  }, [transactions]);
  
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
          borderWidth: 1
        }
      ]
    });
    
    // Hitung persentase kategori
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const totals = Object.entries(categories)
      .map(([category, amount]) => ({
        category: category.replace('_', ' '),
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
    
    setCategoryTotals(totals);
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
  
  return (
    <div className="px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">Laporan</h1>
      </div>
      
      {/* Month Selector */}
      <div className="flex justify-center items-center mb-6">
        <button 
          onClick={handlePreviousMonth}
          className="bg-gray-200 text-gray-700 p-2 rounded-l-md hover:bg-gray-300"
        >
          &lsaquo;
        </button>
        
        <div className="px-4 py-2 bg-gray-100 font-medium">
          {format(selectedDate, 'MMMM yyyy', { locale: id })}
        </div>
        
        <button 
          onClick={handleNextMonth}
          className="bg-gray-200 text-gray-700 p-2 rounded-r-md hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-gray-200"
          disabled={addMonths(selectedDate, 1) > new Date()}
        >
          &rsaquo;
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-white rounded-lg shadow-md p-3">
          <h3 className="text-xs font-medium text-gray-600">Pemasukan</h3>
          <p className="text-sm font-semibold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-3">
          <h3 className="text-xs font-medium text-gray-600">Pengeluaran</h3>
          <p className="text-sm font-semibold text-red-600">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-3">
          <h3 className="text-xs font-medium text-gray-600">Sisa</h3>
          <p className={`text-sm font-semibold ${netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(netSavings)}
          </p>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Pengeluaran per Kategori</h2>
        
        {chartData ? (
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
          <div className="py-10 text-center text-gray-500">
            Tidak ada data pengeluaran untuk periode ini
          </div>
        )}
      </div>
      
      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Rincian Kategori</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-gray-600">Kategori</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-600">Jumlah</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-600">%</th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map(({ category, amount, percentage }) => (
                  <tr key={category} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 capitalize">{category}</td>
                    <td className="py-2 px-2 text-right">{formatCurrency(amount)}</td>
                    <td className="py-2 px-2 text-right">{percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-medium">
                  <td className="py-2 px-2">Total</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(totalExpense)}</td>
                  <td className="py-2 px-2 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}