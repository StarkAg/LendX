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
import { User, Borrower, Transaction, BorrowerSummary } from "@/types";
import TransactionForm from "./TransactionForm";
import InterestComparison from "./InterestComparison";
import { parseISO } from "date-fns";

interface BorrowerDetailProps {
  user: User;
  borrowerId: string;
}

export default function BorrowerDetail({ user, borrowerId }: BorrowerDetailProps) {
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
    const borrowers = storage.getBorrowers(user.id);
    const found = borrowers.find((b) => b.id === borrowerId);
    if (found) {
      setBorrower(found);
    } else {
      router.push("/dashboard");
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

  if (!borrower || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Calculate running balances for all transactions
  const transactionsWithBalance = useMemo(() => {
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
  }, [borrower.transactions, startDate, endDate]);

  const filteredTransactions = filterTransactionsByDate(borrower.transactions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{borrower.name}</h1>
                <p className="text-sm text-gray-600">
                  Interest Rate: {borrower.interestRate}% per week
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowTransactionForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Transaction
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Taken</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalTaken)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Returned</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalReturned)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Current Balance</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(Math.abs(summary.currentBalance))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Daily Interest Rate</h3>
            <p className="text-2xl font-bold text-purple-600">
              {summary.dailyInterestRate.toFixed(4)}%
            </p>
          </div>
        </div>

        {/* Date Filters and As Of Date */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculate Interest As Of
              </label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setAsOfDate(new Date().toISOString().split("T")[0]);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Interest Comparison */}
        <InterestComparison calculations={summary.interestCalculations} />

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Returned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Running Balance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactionsWithBalance.map((transaction) => {
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.type === "taken" ? (
                            <span className="text-blue-600 font-medium">
                              {formatCurrency(transaction.amount)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.type === "returned" ? (
                            <span className="text-green-600 font-medium">
                              {formatCurrency(transaction.amount)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(Math.abs(transaction.runningBalance))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setShowEditTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-900"
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export to Excel
          </button>
          <button
            onClick={async () => {
              await exportToPDF(borrower, filteredTransactions, summary);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Export to PDF
          </button>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          user={user}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Edit Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="taken"
                  checked={type === "taken"}
                  onChange={(e) => setType(e.target.value as "taken")}
                  className="mr-2"
                />
                <span className="text-blue-600 font-medium">Taken</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="returned"
                  checked={type === "returned"}
                  onChange={(e) => setType(e.target.value as "returned")}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">Returned</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

