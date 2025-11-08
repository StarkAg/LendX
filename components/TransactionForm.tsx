"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { User, Borrower, Transaction } from "@/types";

interface TransactionFormProps {
  user: User;
  borrower?: Borrower;
  onClose: () => void;
}

export default function TransactionForm({ user, borrower, onClose }: TransactionFormProps) {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState(borrower?.id || "");
  const [transactionType, setTransactionType] = useState<"taken" | "returned">("taken");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [newBorrowerName, setNewBorrowerName] = useState("");
  const [showNewBorrower, setShowNewBorrower] = useState(false);
  const [interestRate, setInterestRate] = useState("10");
  const [interestMethod, setInterestMethod] = useState<"simple" | "simple_with_repay" | "compound">("compound");

  useEffect(() => {
    const userBorrowers = storage.getBorrowers(user.id);
    setBorrowers(userBorrowers);
    if (borrower) {
      setSelectedBorrowerId(borrower.id);
      setInterestRate(borrower.interestRate.toString());
      setInterestMethod(borrower.interestMethod);
    }
  }, [user.id, borrower]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let borrowerId = selectedBorrowerId;
    let targetBorrower: Borrower;

    // Create new borrower if needed
    if (showNewBorrower && newBorrowerName.trim()) {
      const newBorrower: Borrower = {
        id: generateId(),
        userId: user.id,
        name: newBorrowerName.trim(),
        interestRate: parseFloat(interestRate) || 10,
        interestMethod,
        transactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.saveBorrower(newBorrower);
      borrowerId = newBorrower.id;
      targetBorrower = newBorrower;
    } else {
      targetBorrower = borrowers.find((b) => b.id === borrowerId);
      if (!targetBorrower) {
        alert("Please select a borrower");
        return;
      }
      // Update interest rate and method if changed
      if (targetBorrower.interestRate !== parseFloat(interestRate) || 
          targetBorrower.interestMethod !== interestMethod) {
        targetBorrower.interestRate = parseFloat(interestRate) || 10;
        targetBorrower.interestMethod = interestMethod;
        storage.saveBorrower(targetBorrower);
      }
    }

    const transaction: Transaction = {
      id: generateId(),
      date,
      type: transactionType,
      amount: parseFloat(amount) || 0,
    };

    storage.addTransaction(borrowerId, transaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Add Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Borrower Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Borrower
            </label>
            {!showNewBorrower ? (
              <div className="space-y-2">
                <select
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select borrower</option>
                  {borrowers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewBorrower(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add new borrower
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newBorrowerName}
                  onChange={(e) => setNewBorrowerName(e.target.value)}
                  placeholder="Enter borrower name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewBorrower(false);
                    setNewBorrowerName("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Use existing borrower
                </button>
              </div>
            )}
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="taken"
                  checked={transactionType === "taken"}
                  onChange={(e) => setTransactionType(e.target.value as "taken")}
                  className="mr-2"
                />
                <span className="text-blue-600 font-medium">Taken</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="returned"
                  checked={transactionType === "returned"}
                  onChange={(e) => setTransactionType(e.target.value as "returned")}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">Returned</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Interest Rate */}
          {(showNewBorrower || !borrower) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (% per week)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="10"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Interest Method */}
          {(showNewBorrower || !borrower) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Calculation Method
              </label>
              <select
                value={interestMethod}
                onChange={(e) =>
                  setInterestMethod(e.target.value as "simple" | "simple_with_repay" | "compound")
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="simple">Simple Interest (no repayment consideration)</option>
                <option value="simple_with_repay">Simple Interest (with repayment consideration)</option>
                <option value="compound">Compound Interest (weekly compounding)</option>
              </select>
            </div>
          )}

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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

