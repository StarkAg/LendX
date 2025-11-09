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

    if (showNewBorrower && newBorrowerName.trim()) {
      const newBorrower: Borrower = {
        id: generateId(),
        userId: "default",
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card-minimal rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-border">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-medium text-foreground">Add Transaction</h2>
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground text-xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Borrower Selection */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2">
              Borrower
            </label>
            {!showNewBorrower ? (
              <div className="space-y-2">
                <select
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg focus:ring-1 focus:ring-gold/30 focus:border-gold/30 text-foreground text-sm"
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
                  className="text-xs text-gold hover:text-gold-light transition-colors"
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
                  className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg focus:ring-1 focus:ring-gold/30 focus:border-gold/30 text-foreground placeholder-foreground/30 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewBorrower(false);
                    setNewBorrowerName("");
                  }}
                  className="text-xs text-foreground/40 hover:text-foreground transition-colors"
                >
                  ← Use existing borrower
                </button>
              </div>
            )}
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2">
              Transaction Type
            </label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="taken"
                  checked={transactionType === "taken"}
                  onChange={(e) => setTransactionType(e.target.value as "taken")}
                  className="mr-2 w-4 h-4 text-gold focus:ring-gold bg-dark border-border"
                />
                <span className="text-sm text-foreground">Taken</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="returned"
                  checked={transactionType === "returned"}
                  onChange={(e) => setTransactionType(e.target.value as "returned")}
                  className="mr-2 w-4 h-4 text-gold focus:ring-gold bg-dark border-border"
                />
                <span className="text-sm text-foreground">Returned</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg focus:ring-1 focus:ring-gold/30 focus:border-gold/30 text-foreground placeholder-foreground/30 text-sm"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg focus:ring-1 focus:ring-gold/30 focus:border-gold/30 text-foreground text-sm"
              required
            />
          </div>

          {/* Interest Rate */}
          {(showNewBorrower || !borrower) && (
            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-2">
                Interest Rate (% per week)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="10"
                min="0"
                step="0.1"
                className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg focus:ring-1 focus:ring-gold/30 focus:border-gold/30 text-foreground placeholder-foreground/30 text-sm"
              />
            </div>
          )}

          {/* Interest Method */}
          {(showNewBorrower || !borrower) && (
            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-2">
                Interest Calculation Method
              </label>
              <select
                value={interestMethod}
                onChange={(e) =>
                  setInterestMethod(e.target.value as "simple" | "simple_with_repay" | "compound")
                }
                className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg focus:ring-1 focus:ring-gold/30 focus:border-gold/30 text-foreground text-sm"
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
              className="flex-1 px-4 py-2.5 border border-border text-foreground/60 rounded-lg hover:bg-dark hover:text-foreground transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-gold-subtle px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
