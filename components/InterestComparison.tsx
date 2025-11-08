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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Interest Calculation Comparison</h2>
        <p className="text-sm text-gray-600 mt-1">
          Comparison of all three calculation methods side-by-side
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Simple Interest (No Repayment) */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Simple Interest</h3>
          <p className="text-xs text-gray-500 mb-4">(No repayment consideration)</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Principal:</span>
              <span className="text-sm font-medium">{formatCurrency(simple.principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Interest:</span>
              <span className="text-sm font-medium text-yellow-600">
                {formatCurrency(simple.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800">Total Amount:</span>
              <span className="text-sm font-bold text-blue-600">
                {formatCurrency(simple.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Simple Interest (With Repayment) */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Simple Interest</h3>
          <p className="text-xs text-gray-500 mb-4">(With repayment consideration)</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Principal:</span>
              <span className="text-sm font-medium">{formatCurrency(simpleWithRepay.principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Interest:</span>
              <span className="text-sm font-medium text-yellow-600">
                {formatCurrency(simpleWithRepay.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800">Total Amount:</span>
              <span className="text-sm font-bold text-blue-600">
                {formatCurrency(simpleWithRepay.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Compound Interest */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Compound Interest</h3>
          <p className="text-xs text-gray-500 mb-4">(Weekly compounding)</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Principal:</span>
              <span className="text-sm font-medium">{formatCurrency(compound.principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Interest:</span>
              <span className="text-sm font-medium text-yellow-600">
                {formatCurrency(compound.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800">Total Amount:</span>
              <span className="text-sm font-bold text-purple-600">
                {formatCurrency(compound.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Week-by-week breakdown for compound interest */}
      {compound.breakdown && compound.breakdown.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 mb-4">Compound Interest Week-by-Week Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Week
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Start Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    End Date
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Principal
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Interest
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {compound.breakdown.map((week, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {week.week}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(week.startDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(week.endDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(week.principal)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-yellow-600">
                      {formatCurrency(week.interest)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-purple-600">
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

