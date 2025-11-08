"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import {
  calculateSimpleInterest,
  calculateSimpleInterestWithRepayment,
  calculateCompoundInterest,
  calculateRunningBalance,
  getDailyInterestRate,
} from "@/lib/calculations";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import { Borrower, Transaction, BorrowerSummary } from "@/types";
import TransactionForm from "./TransactionForm";
import InterestComparison from "./InterestComparison";
import { parseISO } from "date-fns";

interface BorrowerDetailProps {
  borrowerId: string;
}

export default function BorrowerDetail({ borrowerId }: BorrowerDetailProps) {
  const router = useRouter();
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showEditTransaction, setShowEditTransaction] = useState<Transaction | null>(null);
  const [summary, setSummary] = useState<BorrowerSummary | null>(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadBorrower();
  }, [borrowerId]);

  useEffect(() => {
    if (borrower) {
      calculateSummary();
    }
  }, [borrower, asOfDate]);

  const loadBorrower = () => {
    const borrowers = storage.getAllBorrowers();
    const found = borrowers.find((b) => b.id === borrowerId);
    if (found) {
      setBorrower(found);
    } else {
      router.push("/");
    }
  };

  const calculateSummary = () => {
    if (!borrower) return;

    const filteredTransactions = filterTransactionsByDate(borrower.transactions);
    const asOf = parseISO(asOfDate);

    const totalTaken = filteredTransactions
      .filter((t) => t.type === "taken")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReturned = filteredTransactions
      .filter((t) => t.type === "returned")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = calculateRunningBalance(filteredTransactions);

    const simple = calculateSimpleInterest(borrower, filteredTransactions, asOf);
    const simpleWithRepay = calculateSimpleInterestWithRepayment(
      borrower,
      filteredTransactions,
      asOf
    );
    const compound = calculateCompoundInterest(borrower, filteredTransactions, asOf);

    const dailyInterestRate = getDailyInterestRate(borrower.interestRate);

    setSummary({
      totalTaken,
      totalReturned,
      currentBalance,
      interestCalculations: {
        simple,
        simpleWithRepay,
        compound,
      },
      dailyInterestRate,
    });
  };

  const filterTransactionsByDate = (transactions: Transaction[]): Transaction[] => {
    if (!startDate && !endDate) return transactions;
    return transactions.filter((t) => {
      const transactionDate = t.date;
      if (startDate && transactionDate < startDate) return false;
      if (endDate && transactionDate > endDate) return false;
      return true;
    });
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      storage.deleteTransaction(borrowerId, transactionId);
      loadBorrower();
    }
  };

  const handleEditTransaction = (transaction: Transaction, updates: Partial<Transaction>) => {
    storage.updateTransaction(borrowerId, transaction.id, updates);
    loadBorrower();
    setShowEditTransaction(null);
  };

  // Calculate running balances for all transactions
  const transactionsWithBalance = useMemo(() => {
    if (!borrower) return [];
    
    const allTransactions = [...borrower.transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate initial balance if we have a start date filter
    let initialBalance = 0;
    if (startDate) {
      for (const t of allTransactions) {
        if (t.date < startDate) {
          if (t.type === "taken") {
            initialBalance += t.amount;
          } else {
            initialBalance -= t.amount;
          }
        } else {
          break;
        }
      }
    }

    // Calculate running balance for filtered transactions
    const filtered = filterTransactionsByDate(allTransactions);
    let runningBalance = initialBalance;

    return filtered.map((transaction) => {
      if (transaction.type === "taken") {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      return {
        ...transaction,
        runningBalance,
      };
    });
  }, [borrower, startDate, endDate]);

  if (!borrower || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-gold">Loading...</div>
      </div>
    );
  }

  const filteredTransactions = filterTransactionsByDate(borrower.transactions);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-dark border-b border-gold/20 sticky top-0 z-50 backdrop-blur-sm bg-dark/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-gold transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                  {borrower.name}
                </h1>
                <p className="text-sm text-gray-400">
                  Interest Rate: {borrower.interestRate}% per week
                </p>
              </div>
            </div>
            <button
              onClick={() => {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="premium-card rounded-xl p-5">
            <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Total Taken</h3>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary.totalTaken)}</p>
          </div>
          <div className="premium-card rounded-xl p-5">
            <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Total Returned</h3>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(summary.totalReturned)}
            </p>
          </div>
          <div className="premium-card rounded-xl p-5">
            <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Current Balance</h3>
            <p className="text-2xl font-bold text-gold">
              {formatCurrency(Math.abs(summary.currentBalance))}
            </p>
          </div>
          <div className="premium-card rounded-xl p-5">
            <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Daily Interest Rate</h3>
            <p className="text-2xl font-bold text-purple-400">
              {summary.dailyInterestRate.toFixed(4)}%
            </p>
          </div>
        </div>

        {/* Date Filters and As Of Date */}
        <div className="premium-card rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-dark border border-gold/20 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-dark border border-gold/20 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Calculate Interest As Of
              </label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full px-3 py-2 bg-dark border border-gold/20 rounded-lg text-sm text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setAsOfDate(new Date().toISOString().split("T")[0]);
                }}
                className="w-full px-4 py-2 bg-dark border border-gold/30 text-gray-300 rounded-lg hover:bg-dark hover:border-gold/50 transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Interest Comparison */}
        <InterestComparison calculations={summary.interestCalculations} />

        {/* Transaction History */}
        <div className="premium-card rounded-xl overflow-hidden mt-6">
          <div className="px-6 py-5 border-b border-gold/20 bg-dark/50">
            <h2 className="text-xl font-semibold text-gold uppercase tracking-wide">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gold/10">
              <thead className="bg-dark/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Returned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Running Balance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-dark/30 divide-y divide-gold/10">
                {transactionsWithBalance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactionsWithBalance.map((transaction) => {
                    return (
                      <tr key={transaction.id} className="hover:bg-dark/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.type === "taken" ? (
                            <span className="text-blue-400 font-medium">
                              {formatCurrency(transaction.amount)}
                            </span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.type === "returned" ? (
                            <span className="text-green-400 font-medium">
                              {formatCurrency(transaction.amount)}
                            </span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gold">
                          {formatCurrency(Math.abs(transaction.runningBalance))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setShowEditTransaction(transaction)}
                            className="text-blue-400 hover:text-blue-300 mr-4 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={async () => {
              await exportToExcel(borrower, filteredTransactions, summary);
            }}
            className="px-4 py-2 bg-green-600/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
          >
            Export to Excel
          </button>
          <button
            onClick={async () => {
              await exportToPDF(borrower, filteredTransactions, summary);
            }}
            className="px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Export to PDF
          </button>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          borrower={borrower}
          onClose={() => {
            setShowTransactionForm(false);
            loadBorrower();
          }}
        />
      )}

      {/* Edit Transaction Modal */}
      {showEditTransaction && (
        <EditTransactionModal
          transaction={showEditTransaction}
          onSave={(updates) => handleEditTransaction(showEditTransaction, updates)}
          onClose={() => setShowEditTransaction(null)}
        />
      )}
    </div>
  );
}

function EditTransactionModal({
  transaction,
  onSave,
  onClose,
}: {
  transaction: Transaction;
  onSave: (updates: Partial<Transaction>) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(transaction.date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      amount: parseFloat(amount) || 0,
      date,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="premium-card rounded-xl max-w-md w-full border-gold/30">
        <div className="px-6 py-5 border-b border-gold/20 flex justify-between items-center bg-dark/50">
          <h2 className="text-xl font-semibold text-gold uppercase tracking-wide">Edit Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gold text-2xl transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              Transaction Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="taken"
                  checked={type === "taken"}
                  onChange={(e) => setType(e.target.value as "taken")}
                  className="mr-2 w-4 h-4 text-gold focus:ring-gold bg-dark border-gold/30"
                />
                <span className="text-blue-400 font-medium">Taken</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="returned"
                  checked={type === "returned"}
                  onChange={(e) => setType(e.target.value as "returned")}
                  className="mr-2 w-4 h-4 text-gold focus:ring-gold bg-dark border-gold/30"
                />
                <span className="text-green-400 font-medium">Returned</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-dark border border-gold/20 rounded-lg focus:ring-2 focus:ring-gold text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gold/20 rounded-lg focus:ring-2 focus:ring-gold text-white"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gold/30 text-gray-300 rounded-lg hover:bg-dark hover:border-gold/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-gold px-4 py-2 rounded-lg font-semibold uppercase tracking-wide"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function exportToExcel(
  borrower: Borrower,
  transactions: Transaction[],
  summary: BorrowerSummary
) {
  try {
    const XLSX = await import("xlsx");
    const rows: any[][] = [
      ["Borrower Details"],
      ["Name", borrower.name],
      ["Interest Rate", `${borrower.interestRate}% per week`],
      ["Total Taken", summary.totalTaken],
      ["Total Returned", summary.totalReturned],
      ["Current Balance", summary.currentBalance],
      [],
      ["Interest Calculations"],
      ["Method", "Principal", "Interest", "Total Amount"],
      [
        "Simple (No Repay)",
        summary.interestCalculations.simple.principal,
        summary.interestCalculations.simple.totalInterest,
        summary.interestCalculations.simple.totalAmount,
      ],
      [
        "Simple (With Repay)",
        summary.interestCalculations.simpleWithRepay.principal,
        summary.interestCalculations.simpleWithRepay.totalInterest,
        summary.interestCalculations.simpleWithRepay.totalAmount,
      ],
      [
        "Compound",
        summary.interestCalculations.compound.principal,
        summary.interestCalculations.compound.totalInterest,
        summary.interestCalculations.compound.totalAmount,
      ],
      [],
      ["Transaction History"],
      ["Date", "Type", "Amount", "Running Balance"],
    ];

    let runningBalance = 0;
    transactions.forEach((t) => {
      if (t.type === "taken") {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      rows.push([t.date, t.type, t.amount, runningBalance]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Loan Details");
    XLSX.writeFile(wb, `${borrower.name}_loan_details.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Failed to export to Excel. Please try again.");
  }
}

async function exportToPDF(
  borrower: Borrower,
  transactions: Transaction[],
  summary: BorrowerSummary
) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    let yPos = 20;

    // Header
    doc.setFontSize(18);
    doc.text(`Loan Details - ${borrower.name}`, 14, yPos);
    yPos += 10;

    // Borrower Info
    doc.setFontSize(12);
    doc.text(`Interest Rate: ${borrower.interestRate}% per week`, 14, yPos);
    yPos += 7;
    doc.text(`Total Taken: ₹${summary.totalTaken.toLocaleString("en-IN")}`, 14, yPos);
    yPos += 7;
    doc.text(`Total Returned: ₹${summary.totalReturned.toLocaleString("en-IN")}`, 14, yPos);
    yPos += 7;
    doc.text(`Current Balance: ₹${Math.abs(summary.currentBalance).toLocaleString("en-IN")}`, 14, yPos);
    yPos += 10;

    // Interest Calculations
    doc.setFontSize(14);
    doc.text("Interest Calculations", 14, yPos);
    yPos += 8;
    doc.setFontSize(10);

    const methods = [
      { name: "Simple (No Repay)", calc: summary.interestCalculations.simple },
      { name: "Simple (With Repay)", calc: summary.interestCalculations.simpleWithRepay },
      { name: "Compound", calc: summary.interestCalculations.compound },
    ];

    methods.forEach((method) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${method.name}:`, 14, yPos);
      yPos += 6;
      doc.text(`  Principal: ₹${method.calc.principal.toLocaleString("en-IN")}`, 20, yPos);
      yPos += 6;
      doc.text(`  Interest: ₹${method.calc.totalInterest.toLocaleString("en-IN")}`, 20, yPos);
      yPos += 6;
      doc.text(`  Total: ₹${method.calc.totalAmount.toLocaleString("en-IN")}`, 20, yPos);
      yPos += 8;
    });

    // Transactions
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.text("Transaction History", 14, yPos);
    yPos += 8;
    doc.setFontSize(10);

    let runningBalance = 0;
    transactions.slice(0, 20).forEach((t) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      if (t.type === "taken") {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      doc.text(
        `${t.date} - ${t.type} - ₹${t.amount.toLocaleString("en-IN")} - Balance: ₹${Math.abs(
          runningBalance
        ).toLocaleString("en-IN")}`,
        14,
        yPos
      );
      yPos += 6;
    });

    if (transactions.length > 20) {
      doc.text(`... and ${transactions.length - 20} more transactions`, 14, yPos);
    }

    doc.save(`${borrower.name}_loan_details.pdf`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    alert("Failed to export to PDF. Please try again.");
  }
}
