"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateRunningBalance } from "@/lib/calculations";
import { User, Borrower } from "@/types";
import TransactionForm from "./TransactionForm";
import Link from "next/link";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

  useEffect(() => {
    loadBorrowers();
  }, [user.id]);

  const loadBorrowers = () => {
    const userBorrowers = storage.getBorrowers(user.id);
    setBorrowers(userBorrowers);
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    router.push("/");
  };

  const totalOutstanding = borrowers.reduce((sum, borrower) => {
    const balance = calculateRunningBalance(borrower.transactions);
    return sum + balance;
  }, 0);

  const activeLoans = borrowers.filter(
    (borrower) => calculateRunningBalance(borrower.transactions) > 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">LendX</h1>
              <p className="text-sm text-gray-600">Welcome, {user.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Borrowers</h3>
            <p className="text-3xl font-bold text-gray-900">{borrowers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Loans</h3>
            <p className="text-3xl font-bold text-blue-600">{activeLoans.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Outstanding</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="mb-6">
          <button
            onClick={() => {
              setSelectedBorrower(null);
              setShowTransactionForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-colors"
          >
            + Add Transaction
          </button>
        </div>

        {/* Borrowers List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">All Borrowers</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {borrowers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 mb-4">No borrowers yet. Add your first transaction!</p>
                <button
                  onClick={() => setShowTransactionForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
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
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{borrower.name}</h3>
                        <p className="text-sm text-gray-600">
                          {borrower.transactions.length} transaction{borrower.transactions.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : "text-gray-600"
                          }`}
                        >
                          {formatCurrency(Math.abs(balance))}
                        </p>
                        <p className="text-sm text-gray-600">
                          {borrower.interestRate}% per week
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
          user={user}
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

