'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ArrowDownCircle, ArrowUpCircle, Trophy, Gift, Download, RotateCw, Filter, CheckCircle2, Clock3 } from 'lucide-react';

export default function PlayerLedgerTab({ user }) {
  const [records, setRecords] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    try {
      const res = await fetch('/api/ledger');
      const data = await res.json();
      if (data.success && data.records) {
        setRecords(data.records);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filterType === 'all'
    ? records
    : records.filter(r => {
        if (filterType === 'deposit') return r.type?.includes('deposit');
        if (filterType === 'withdraw') return r.type?.includes('withdraw') || r.type?.includes('redemption');
        if (filterType === 'game') return r.type?.includes('game');
        if (filterType === 'bonus') return r.type?.includes('bonus') || r.type?.includes('promo') || r.type?.includes('allotment');
        return true;
      });

  const exportCsv = () => {
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Balance Before', 'Balance After', 'Reference ID', 'Notes'];
    const rows = filtered.map(r => [
      new Date(r.createdAt).toISOString(),
      r.type,
      r.amount,
      r.currency,
      r.balanceBefore,
      r.balanceAfter,
      r.referenceId || '',
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vegas_one_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a0c18] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
              Player Audit Ledger
            </h2>
            <p className="text-xs text-gray-400">
              Immutable double-entry log of all deposits, cashouts, wagers and bonuses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLedger}
            className="p-2.5 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition"
            title="Refresh Ledger"
          >
            <RotateCw size={16} />
          </button>

          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition disabled:opacity-40"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Transactions' },
          { id: 'deposit', label: 'Deposits' },
          { id: 'withdraw', label: 'Cashouts / Redemptions' },
          { id: 'game', label: 'Game Wagers & Wins' },
          { id: 'bonus', label: 'Bonuses & Streaks' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              filterType === tab.id
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950/40'
                : 'bg-[#0d1022] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-[#0a0c18] border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">Loading ledger records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No transaction records found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0e1124] text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Notes / Details</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item, idx) => {
                  const isPositive = Number(item.amount) > 0;
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-mono text-gray-400 text-[11px] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white capitalize">
                          {item.type?.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? `+${Number(item.amount).toFixed(2)}` : Number(item.amount).toFixed(2)} {item.currency || 'SC'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-amber-300 font-bold whitespace-nowrap">
                        {Number(item.balanceAfter || 0).toFixed(2)} {item.currency || 'SC'}
                      </td>

                      <td className="py-3 px-4 text-gray-300 text-[11px] max-w-xs truncate">
                        {item.notes || item.referenceId || 'System audit'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          <CheckCircle2 size={12} />
                          <span>Logged</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
