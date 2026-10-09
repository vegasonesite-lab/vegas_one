'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, Sparkles, CheckCircle2 } from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md p-6 bg-[#0e1122] border border-purple-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Notifications</h2>
            <p className="text-xs text-gray-400">Bonus alerts and account notices</p>
          </div>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No new notifications. Check back for upcoming coin drops!
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-[#070914] border border-white/5 space-y-1 hover:border-purple-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-400">{n.title}</h4>
                  <span className="text-[10px] text-gray-500">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
