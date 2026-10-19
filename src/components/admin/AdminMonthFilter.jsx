'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { getRecentMonthsList } from '@/lib/dateUtils';

export default function AdminMonthFilter({
  selectedMonth = 'all',
  onChange,
  showTimezoneBadge = true,
  className = '',
}) {
  const recentMonths = getRecentMonthsList(12);

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`} style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
      {/* Month Dropdown Container */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition"
        style={{
          backgroundColor: '#070514',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Calendar size={14} className="text-[#00F0FF] shrink-0" />
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Month:</span>
        <select
          value={selectedMonth}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="bg-transparent text-[#00F0FF] text-xs font-black outline-none cursor-pointer pr-1"
          style={{ fontFamily: 'Lexend, sans-serif' }}
        >
          <option value="all" className="bg-[#0C0A1E] text-white">
            All Time (All Records)
          </option>
          {recentMonths.map((m) => (
            <option key={m.key} value={m.key} className="bg-[#0C0A1E] text-white">
              {m.label} (CST)
            </option>
          ))}
        </select>
      </div>

      {/* Timezone Indicator Badge */}
      {showTimezoneBadge && (
        <span
          className="text-[10px] font-mono px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold shrink-0"
          style={{
            backgroundColor: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.22)',
            color: '#00F0FF',
          }}
          title="Calculated strictly using Central Standard Time (America/Chicago) boundaries"
        >
          <Clock size={11} className="text-cyan-400" />
          <span>CST / US Central</span>
        </span>
      )}
    </div>
  );
}
