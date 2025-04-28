import Dexie, { Table } from 'dexie';

// Definisi tipe data transaksi
export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt?: string;
}

// Kelas database yang mewarisi Dexie
class WalletDatabase extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super('walletApp');
    this.version(1).stores({
      transactions: '++id, type, amount, category, date, createdAt'
    });
  }
}

// Inisialisasi database
const db = new WalletDatabase();

// Fungsi helper untuk operasi database
//funsgi untuk menambahkan transaksi
export const addTransaction = async (transaction: Transaction): Promise<number> => {
  return await db.transactions.add({
    ...transaction,
    createdAt: new Date().toISOString()
  });
};

//fungsi untuk mendapatkan semua transaksi
export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await db.transactions.orderBy('date').reverse().toArray();
};


//fungsi untuk mendapatkan transaksi berdasarkan bulan
export const getTransactionsByMonth = async (year: number, month: number): Promise<Transaction[]> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return await db.transactions
    .where('date')
    .between(
      startDate.toISOString(),
      endDate.toISOString()
    )
    .toArray();
};

//fungsi untuk menghapus transaksi
export const deleteTransaction = async (id: number): Promise<void> => {
  await db.transactions.delete(id);
};

export default db;