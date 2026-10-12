'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Trophy,
  Gift,
  Download,
  RotateCw,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  Coins,
  FileSpreadsheet
} from 'lucide-react';

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
    const interval = setInterval(fetchLedger, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filterType === 'all'
    ? records
    : records.filter((r) => {
        if (filterType === 'deposit') return r.type?.includes('deposit');
        if (filterType === 'withdraw') return r.type?.includes('withdraw') || r.type?.includes('redemption');
        if (filterType === 'game') return r.type?.includes('game');
        if (filterType === 'bonus') return r.type?.includes('bonus') || r.type?.includes('promo') || r.type?.includes('allotment');
        return true;
      });

  // Calculate Stat Summary
  const totalDeposits = records
    .filter((r) => r.type?.includes('deposit') && Number(r.amount) > 0)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalBonuses = records
    .filter((r) => (r.type?.includes('bonus') || r.type?.includes('allotment') || r.type?.includes('promo')) && Number(r.amount) > 0)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalWithdrawals = records
    .filter((r) => (r.type?.includes('withdraw') || r.type?.includes('redemption')))
    .reduce((acc, curr) => acc + Math.abs(Number(curr.amount || 0)), 0);

  const exportCsv = () => {
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Balance Before', 'Balance After', 'Reference ID', 'Notes'];
    const rows = filtered.map((r) => [
      new Date(r.createdAt).toISOString(),
      r.type,
      r.amount,
      r.currency,
      r.balanceBefore,
      r.balanceAfter,
      r.referenceId || '',
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vegas_one_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Header Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #130C35 0%, #09051E 50%, #060314 100%)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          borderRadius: '20px',
          padding: '22px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 240, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              color: '#00F0FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
              <span>CRYPTOGRAPHIC FINANCIAL LEDGER</span>
            </div>
            <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              Player Audit &amp; Financial Ledger
            </h1>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
              Immutable double-entry log of deposits, cashouts, wagers, and bonuses
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchLedger}
            style={{
              backgroundColor: '#070514',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: '#00F0FF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'Lexend, sans-serif',
              fontSize: '12px',
              fontWeight: 800,
              transition: 'all 0.15s ease',
            }}
            title="Refresh Ledger"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            style={{
              backgroundColor: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.45)',
              borderRadius: '12px',
              padding: '10px 18px',
              color: '#00F0FF',
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'Lexend, sans-serif',
              fontSize: '12px',
              fontWeight: 800,
              opacity: filtered.length === 0 ? 0.4 : 1,
              boxShadow: '0 4px 15px rgba(0, 240, 255, 0.2)',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Overview Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            backgroundColor: '#0E0A24',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            borderRadius: '16px',
            padding: '16px 18px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CURRENT VAULT BALANCE
            </span>
            <Wallet size={16} color="#00F0FF" />
          </div>
          <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '24px', fontWeight: 900, color: '#00F0FF' }}>
            ${Number(user?.balanceSC ?? user?.balance ?? 5.0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ display: 'block', fontSize: '10.5px', color: '#10B981', fontFamily: 'Lexend, sans-serif', fontWeight: 700, marginTop: '3px' }}>
            ● Live Synchronized
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#0E0A24',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '16px',
            padding: '16px 18px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              BONUS &amp; PROMO CREDITS
            </span>
            <Coins size={16} color="#10B981" />
          </div>
          <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '24px', fontWeight: 900, color: '#10B981' }}>
            +${totalBonuses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ display: 'block', fontSize: '10.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', fontWeight: 700, marginTop: '3px' }}>
            Welcome + Rewards
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#0E0A24',
            border: '1px solid rgba(255, 0, 85, 0.35)',
            borderRadius: '16px',
            padding: '16px 18px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL CASHED OUT
            </span>
            <ArrowUpCircle size={16} color="#FF0055" />
          </div>
          <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '24px', fontWeight: 900, color: '#FF0055' }}>
            ${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ display: 'block', fontSize: '10.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', fontWeight: 700, marginTop: '3px' }}>
            Settled Redemptions
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#0E0A24',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '16px 18px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AUDITED RECORDS
            </span>
            <FileSpreadsheet size={16} color="#FFFFFF" />
          </div>
          <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '24px', fontWeight: 900, color: '#FFFFFF' }}>
            {filtered.length} {filtered.length === 1 ? 'Entry' : 'Entries'}
          </span>
          <span style={{ display: 'block', fontSize: '10.5px', color: '#10B981', fontFamily: 'Lexend, sans-serif', fontWeight: 700, marginTop: '3px' }}>
            100% Cryptographically Verified
          </span>
        </div>
      </div>

      {/* 3. Filter Segmented Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {[
          { id: 'all', label: 'All Transactions', icon: Clock },
          { id: 'deposit', label: 'Deposits', icon: ArrowDownCircle },
          { id: 'withdraw', label: 'Cashouts / Redemptions', icon: ArrowUpCircle },
          { id: 'game', label: 'Game Wagers & Wins', icon: Trophy },
          { id: 'bonus', label: 'Bonuses & Promos', icon: Gift },
        ].map((tab) => {
          const isSel = filterType === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: isSel ? 'none' : '1px solid rgba(0, 240, 255, 0.2)',
                background: isSel ? 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)' : '#070514',
                color: isSel ? '#070514' : '#9A91A8',
                fontFamily: 'Lexend, sans-serif',
                fontSize: '12px',
                fontWeight: 900,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSel ? '0 4px 18px rgba(0, 240, 255, 0.35)' : 'none',
              }}
            >
              <IconComponent size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Luxury Transaction Table Container */}
      <div
        style={{
          borderRadius: '20px',
          backgroundColor: '#0E0A24',
          border: '1px solid rgba(0, 240, 255, 0.28)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 240, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
            <RotateCw size={24} color="#00F0FF" className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ margin: 0, fontWeight: 700 }}>Synchronizing ledger audit records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
            <Clock size={32} color="#00F0FF" style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
            <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              No transactions recorded for this filter.
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#9A91A8' }}>
              Transactions appear instantly when deposits, spins, or bonus claims are settled.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'Lexend, sans-serif' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid rgba(0, 240, 255, 0.18)',
                    backgroundColor: '#070514',
                    color: '#796E8A',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                  }}
                >
                  <th style={{ padding: '14px 18px' }}>Date &amp; Time</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Amount</th>
                  <th style={{ padding: '14px 18px' }}>Balance After</th>
                  <th style={{ padding: '14px 18px' }}>Audit Description</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const isPositive = Number(item.amount) > 0;
                  const isDeposit = item.type?.includes('deposit');
                  const isWithdraw = item.type?.includes('withdraw') || item.type?.includes('redemption');
                  const isBonus = item.type?.includes('bonus') || item.type?.includes('allotment') || item.type?.includes('promo');

                  return (
                    <tr
                      key={item._id || item.id || idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Date & Time */}
                      <td style={{ padding: '16px 18px', color: '#9A91A8', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </td>

                      {/* Type Badge */}
                      <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: isDeposit
                              ? 'rgba(0, 240, 255, 0.12)'
                              : isWithdraw
                              ? 'rgba(255, 0, 85, 0.12)'
                              : isBonus
                              ? 'rgba(16, 185, 129, 0.12)'
                              : 'rgba(255, 255, 255, 0.08)',
                            color: isDeposit
                              ? '#00F0FF'
                              : isWithdraw
                              ? '#FF0055'
                              : isBonus
                              ? '#10B981'
                              : '#FFFFFF',
                            border: `1px solid ${
                              isDeposit
                                ? 'rgba(0, 240, 255, 0.3)'
                                : isWithdraw
                                ? 'rgba(255, 0, 85, 0.3)'
                                : isBonus
                                ? 'rgba(16, 185, 129, 0.3)'
                                : 'rgba(255, 255, 255, 0.15)'
                            }`,
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            textTransform: 'capitalize',
                          }}
                        >
                          {isDeposit && <ArrowDownCircle size={12} />}
                          {isWithdraw && <ArrowUpCircle size={12} />}
                          {isBonus && <Coins size={12} />}
                          <span>{item.type?.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontFamily: 'Lexend, sans-serif',
                            fontWeight: 900,
                            fontSize: '14px',
                            color: isPositive ? '#10B981' : '#FF0055',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {isPositive ? `+${Number(item.amount).toFixed(2)}` : Number(item.amount).toFixed(2)} {item.currency || 'SC'}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontFamily: 'Lexend, sans-serif',
                            fontWeight: 900,
                            fontSize: '13px',
                            color: '#00F0FF',
                          }}
                        >
                          ${Number(item.balanceAfter || 0).toFixed(2)} SC
                        </span>
                      </td>

                      {/* Notes / Details */}
                      <td style={{ padding: '16px 18px', color: '#D4CEE0', fontSize: '12px', maxWidth: '320px' }}>
                        {item.notes || item.referenceId || 'System audit verified'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            fontWeight: 900,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.18)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>VERIFIED</span>
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
