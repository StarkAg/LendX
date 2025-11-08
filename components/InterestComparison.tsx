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
    <div className="card-minimal rounded-xl overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-base font-medium text-foreground">Interest Calculation Comparison</h2>
        <p className="text-xs text-foreground/40 mt-1">
          Comparison of all three calculation methods
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {/* Simple Interest (No Repayment) */}
        <div className="card-minimal rounded-lg p-5 border-border">
          <h3 className="text-sm font-medium text-foreground mb-1">Simple Interest</h3>
          <p className="text-xs text-foreground/40 mb-4">No repayment consideration</p>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-xs text-foreground/50">Principal</span>
              <span className="text-sm font-light text-foreground">{formatCurrency(simple.principal)}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-xs text-foreground/50">Interest</span>
              <span className="text-sm font-light text-gold">
                {formatCurrency(simple.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-xs font-medium text-foreground/60">Total</span>
              <span className="text-base font-light text-foreground">
                {formatCurrency(simple.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Simple Interest (With Repayment) */}
        <div className="card-minimal rounded-lg p-5 border-border">
          <h3 className="text-sm font-medium text-foreground mb-1">Simple Interest</h3>
          <p className="text-xs text-foreground/40 mb-4">With repayment consideration</p>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-xs text-foreground/50">Principal</span>
              <span className="text-sm font-light text-foreground">{formatCurrency(simpleWithRepay.principal)}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-xs text-foreground/50">Interest</span>
              <span className="text-sm font-light text-gold">
                {formatCurrency(simpleWithRepay.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-xs font-medium text-foreground/60">Total</span>
              <span className="text-base font-light text-foreground">
                {formatCurrency(simpleWithRepay.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Compound Interest */}
        <div className="card-minimal rounded-lg p-5 border-border border-gold/20">
          <h3 className="text-sm font-medium text-foreground mb-1">Compound Interest</h3>
          <p className="text-xs text-foreground/40 mb-4">Weekly compounding</p>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-xs text-foreground/50">Principal</span>
              <span className="text-sm font-light text-foreground">{formatCurrency(compound.principal)}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-xs text-foreground/50">Interest</span>
              <span className="text-sm font-light text-gold">
                {formatCurrency(compound.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-xs font-medium text-foreground/60">Total</span>
              <span className="text-base font-light text-gold">
                {formatCurrency(compound.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Week-by-week breakdown for compound interest */}
      {compound.breakdown && compound.breakdown.length > 0 && (
        <div className="px-6 py-5 border-t border-border bg-dark/30">
          <h3 className="text-sm font-medium text-foreground mb-4">Week-by-Week Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-dark/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {compound.breakdown.map((week, index) => (
                  <tr key={index} className="hover:bg-dark/30 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gold font-light">
                      {week.week}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground/60">
                      {formatDate(week.startDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground/60">
                      {formatDate(week.endDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-foreground/80">
                      {formatCurrency(week.principal)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gold">
                      {formatCurrency(week.interest)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-light text-foreground">
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
