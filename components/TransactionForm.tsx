"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { Borrower, Transaction } from "@/types";

interface TransactionFormProps {
  borrower?: Borrower;
  onClose: () => void;
}

export default function TransactionForm({ borrower, onClose }: TransactionFormProps) {
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
    const allBorrowers = storage.getAllBorrowers();
    setBorrowers(allBorrowers);
    if (borrower) {
      setSelectedBorrowerId(borrower.id);
      setInterestRate(borrower.interestRate.toString());
      setInterestMethod(borrower.interestMethod);
    }
  }, [borrower]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let borrowerId = selectedBorrowerId;
    let targetBorrower: Borrower | null = null;

    // Create new borrower if needed
    if (showNewBorrower && newBorrowerName.trim()) {
      const newBorrower: Borrower = {
        id: generateId(),
        userId: "default", // No user authentication
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
      targetBorrower = borrowers.find((b) => b.id === borrowerId) || null;
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

    if (!targetBorrower) {
      alert("Please select or create a borrower");
      return;
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="premium-card rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-gold/30">
        <div className="px-6 py-5 border-b border-gold/20 flex justify-between items-center bg-dark/50">
          <h2 className="text-xl font-semibold text-gold uppercase tracking-wide">Add Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gold text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Borrower Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              Borrower
            </label>
            {!showNewBorrower ? (
              <div className="space-y-2">
                <select
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gold/20 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-white"
                  required
                >
                  <option value="" className="bg-dark">Select borrower</option>
                  {borrowers.map((b) => (
                    <option key={b.id} value={b.id} className="bg-dark">
                      {b.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewBorrower(true)}
                  className="text-sm text-gold hover:text-gold-light transition-colors"
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
                  className="w-full px-4 py-3 bg-dark border border-gold/20 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-white placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewBorrower(false);
                    setNewBorrowerName("");
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  ← Use existing borrower
                </button>
              </div>
            )}
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              Transaction Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="taken"
                  checked={transactionType === "taken"}
                  onChange={(e) => setTransactionType(e.target.value as "taken")}
                  className="mr-2 w-4 h-4 text-gold focus:ring-gold bg-dark border-gold/30"
                />
                <span className="text-blue-400 font-medium">Taken</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="returned"
                  checked={transactionType === "returned"}
                  onChange={(e) => setTransactionType(e.target.value as "returned")}
                  className="mr-2 w-4 h-4 text-gold focus:ring-gold bg-dark border-gold/30"
                />
                <span className="text-green-400 font-medium">Returned</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-dark border border-gold/20 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gold/20 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-white"
              required
            />
          </div>

          {/* Interest Rate */}
          {(showNewBorrower || !borrower) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                Interest Rate (% per week)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="10"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 bg-dark border border-gold/20 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-white placeholder-gray-500"
              />
            </div>
          )}

          {/* Interest Method */}
          {(showNewBorrower || !borrower) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                Interest Calculation Method
              </label>
              <select
                value={interestMethod}
                onChange={(e) =>
                  setInterestMethod(e.target.value as "simple" | "simple_with_repay" | "compound")
                }
                className="w-full px-4 py-3 bg-dark border border-gold/20 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-white"
              >
                <option value="simple" className="bg-dark">Simple Interest (no repayment consideration)</option>
                <option value="simple_with_repay" className="bg-dark">Simple Interest (with repayment consideration)</option>
                <option value="compound" className="bg-dark">Compound Interest (weekly compounding)</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gold/30 text-gray-300 rounded-lg hover:bg-dark hover:border-gold/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-gold px-4 py-3 rounded-lg font-semibold uppercase tracking-wide"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
