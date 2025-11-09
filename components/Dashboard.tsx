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
      {/* Header - Minimal */}
      <header className="border-b border-border sticky top-0 z-50 backdrop-blur-xl bg-black/60">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-light text-foreground tracking-tight">
                LendX
              </h1>
              <p className="text-xs text-foreground/50 mt-1 font-light">Loan tracking</p>
            </div>
            <button
              onClick={() => {
                setSelectedBorrower(null);
                setShowTransactionForm(true);
              }}
              className="btn-gold-subtle px-5 py-2.5 rounded-lg text-sm font-medium"
            >
              + Add Transaction
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Summary Cards - Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="card-minimal rounded-xl p-6">
            <p className="text-xs text-foreground/50 mb-3 font-medium">Total Borrowers</p>
            <p className="text-3xl font-light text-foreground">{borrowers.length}</p>
          </div>
          <div className="card-minimal rounded-xl p-6">
            <p className="text-xs text-foreground/50 mb-3 font-medium">Active Loans</p>
            <p className="text-3xl font-light text-foreground">{activeLoans.length}</p>
          </div>
          <div className="card-minimal rounded-xl p-6">
            <p className="text-xs text-foreground/50 mb-3 font-medium">Total Outstanding</p>
            <p className="text-3xl font-light text-gold">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>

        {/* Borrowers List - Minimal */}
        <div className="card-minimal rounded-xl overflow-hidden">
          {borrowers.length === 0 ? (
            <div className="px-8 py-20 text-center">
              <div className="text-4xl mb-4 opacity-30">💎</div>
              <p className="text-foreground/60 mb-6 text-sm">No borrowers yet</p>
              <button
                onClick={() => setShowTransactionForm(true)}
                className="btn-gold-subtle px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                Add Transaction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {borrowers.map((borrower) => {
                const balance = calculateRunningBalance(borrower.transactions);
                return (
                  <Link
                    key={borrower.id}
                    href={`/borrower/${borrower.id}`}
                    className="block px-6 py-5 hover:bg-dark/50 transition-colors group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-medium text-foreground group-hover:text-gold transition-colors mb-1">
                          {borrower.name}
                        </h3>
                        <p className="text-xs text-foreground/40">
                          {borrower.transactions.length} transaction{borrower.transactions.length !== 1 ? "s" : ""} · {borrower.interestRate}% per week
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-light ${
                            balance > 0 ? "text-foreground" : balance < 0 ? "text-foreground/60" : "text-foreground/40"
                          }`}
                        >
                          {formatCurrency(Math.abs(balance))}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
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
