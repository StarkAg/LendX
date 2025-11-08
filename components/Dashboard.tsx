"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateRunningBalance } from "@/lib/calculations";
import { Borrower } from "@/types";
import TransactionForm from "./TransactionForm";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

  useEffect(() => {
    loadBorrowers();
  }, []);

  const loadBorrowers = () => {
    // Get all borrowers (no user filtering)
    const allBorrowers = storage.getAllBorrowers();
    setBorrowers(allBorrowers);
  };

  const totalOutstanding = borrowers.reduce((sum, borrower) => {
    const balance = calculateRunningBalance(borrower.transactions);
    return sum + balance;
  }, 0);

  const activeLoans = borrowers.filter(
    (borrower) => calculateRunningBalance(borrower.transactions) > 0
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-dark border-b border-gold/20 sticky top-0 z-50 backdrop-blur-sm bg-dark/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gold mb-1 bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                LendX
              </h1>
              <p className="text-sm text-gray-400">Premium Loan Tracking</p>
            </div>
            <button
              onClick={() => {
                setSelectedBorrower(null);
                setShowTransactionForm(true);
              }}
              className="btn-gold px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide"
            >
              + Add Transaction
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="premium-card rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Total Borrowers</h3>
            <p className="text-4xl font-bold text-gold">{borrowers.length}</p>
          </div>
          <div className="premium-card rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Active Loans</h3>
            <p className="text-4xl font-bold text-blue-400">{activeLoans.length}</p>
          </div>
          <div className="premium-card rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Total Outstanding</h3>
            <p className="text-4xl font-bold text-green-400">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>

        {/* Borrowers List */}
        <div className="premium-card rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gold/20 bg-dark/50">
            <h2 className="text-xl font-semibold text-gold uppercase tracking-wide">All Borrowers</h2>
          </div>
          <div className="divide-y divide-gold/10">
            {borrowers.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-6xl mb-4">💎</div>
                <p className="text-gray-400 mb-4 text-lg">No borrowers yet. Add your first transaction!</p>
                <button
                  onClick={() => setShowTransactionForm(true)}
                  className="btn-gold px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide"
                >
                  Add Transaction
                </button>
              </div>
            ) : (
              borrowers.map((borrower) => {
                const balance = calculateRunningBalance(borrower.transactions);
                return (
                  <Link
                    key={borrower.id}
                    href={`/borrower/${borrower.id}`}
                    className="block px-6 py-5 hover:bg-dark/50 transition-colors group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
                          {borrower.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {borrower.transactions.length} transaction{borrower.transactions.length !== 1 ? "s" : ""} • {borrower.interestRate}% per week
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${
                            balance > 0 ? "text-green-400" : balance < 0 ? "text-red-400" : "text-gray-400"
                          }`}
                        >
                          {formatCurrency(Math.abs(balance))}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {balance > 0 ? "Outstanding" : balance < 0 ? "Credit" : "Settled"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          borrower={selectedBorrower || undefined}
          onClose={() => {
            setShowTransactionForm(false);
            setSelectedBorrower(null);
            loadBorrowers();
          }}
        />
      )}
    </div>
  );
}
