"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { InterestCalculation } from "@/types";
import { format, parseISO } from "date-fns";

interface InterestComparisonProps {
  calculations: {
    simple: InterestCalculation;
    simpleWithRepay: InterestCalculation;
    compound: InterestCalculation;
  };
}

export default function InterestComparison({ calculations }: InterestComparisonProps) {
  const { simple, simpleWithRepay, compound } = calculations;

  return (
    <div className="premium-card rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gold/20 bg-dark/50">
        <h2 className="text-xl font-semibold text-gold uppercase tracking-wide">Interest Calculation Comparison</h2>
        <p className="text-sm text-gray-400 mt-1">
          Comparison of all three calculation methods side-by-side
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Simple Interest (No Repayment) */}
        <div className="premium-card rounded-lg p-5 border-gold/20">
          <h3 className="text-sm font-medium text-gold mb-2 uppercase tracking-wide">Simple Interest</h3>
          <p className="text-xs text-gray-500 mb-4">(No repayment consideration)</p>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gold/10 pb-2">
              <span className="text-sm text-gray-400">Principal:</span>
              <span className="text-sm font-medium text-white">{formatCurrency(simple.principal)}</span>
            </div>
            <div className="flex justify-between border-b border-gold/10 pb-2">
              <span className="text-sm text-gray-400">Interest:</span>
              <span className="text-sm font-medium text-gold">
                {formatCurrency(simple.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-sm font-semibold text-white uppercase tracking-wide">Total Amount:</span>
              <span className="text-lg font-bold text-blue-400">
                {formatCurrency(simple.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Simple Interest (With Repayment) */}
        <div className="premium-card rounded-lg p-5 border-gold/20">
          <h3 className="text-sm font-medium text-gold mb-2 uppercase tracking-wide">Simple Interest</h3>
          <p className="text-xs text-gray-500 mb-4">(With repayment consideration)</p>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gold/10 pb-2">
              <span className="text-sm text-gray-400">Principal:</span>
              <span className="text-sm font-medium text-white">{formatCurrency(simpleWithRepay.principal)}</span>
            </div>
            <div className="flex justify-between border-b border-gold/10 pb-2">
              <span className="text-sm text-gray-400">Interest:</span>
              <span className="text-sm font-medium text-gold">
                {formatCurrency(simpleWithRepay.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-sm font-semibold text-white uppercase tracking-wide">Total Amount:</span>
              <span className="text-lg font-bold text-blue-400">
                {formatCurrency(simpleWithRepay.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Compound Interest */}
        <div className="premium-card rounded-lg p-5 border-gold/30 ring-2 ring-gold/20">
          <h3 className="text-sm font-medium text-gold mb-2 uppercase tracking-wide">Compound Interest</h3>
          <p className="text-xs text-gray-500 mb-4">(Weekly compounding)</p>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gold/10 pb-2">
              <span className="text-sm text-gray-400">Principal:</span>
              <span className="text-sm font-medium text-white">{formatCurrency(compound.principal)}</span>
            </div>
            <div className="flex justify-between border-b border-gold/10 pb-2">
              <span className="text-sm text-gray-400">Interest:</span>
              <span className="text-sm font-medium text-gold">
                {formatCurrency(compound.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-sm font-semibold text-white uppercase tracking-wide">Total Amount:</span>
              <span className="text-lg font-bold text-purple-400">
                {formatCurrency(compound.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Week-by-week breakdown for compound interest */}
      {compound.breakdown && compound.breakdown.length > 0 && (
        <div className="px-6 py-5 border-t border-gold/20 bg-dark/30">
          <h3 className="text-sm font-medium text-gold mb-4 uppercase tracking-wide">Compound Interest Week-by-Week Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gold/10">
              <thead className="bg-dark/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-dark/30 divide-y divide-gold/10">
                {compound.breakdown.map((week, index) => (
                  <tr key={index} className="hover:bg-dark/50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gold font-medium">
                      {week.week}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(week.startDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(week.endDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-white">
                      {formatCurrency(week.principal)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gold">
                      {formatCurrency(week.interest)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-purple-400">
                      {formatCurrency(week.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
