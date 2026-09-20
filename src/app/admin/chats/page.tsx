'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ClassChatMessage, ClassModel } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  Filter,
  FileText,
  Download,
  AlertTriangle,
  ZoomIn,
  X,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function AdminChatsPage() {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [messages, setMessages] = useState<ClassChatMessage[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resClasses, resChats] = await Promise.all([
        fetch('/api/classes').then((r) => r.json()),
        fetch('/api/classroom/chat?meetingId=general').then((r) => r.json()),
      ]);

      if (resClasses.success) {
        setClasses(resClasses.classes || []);
      }
    } catch (e) {
      console.error('Failed to load classes for chat log:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch messages when selected class changes
  useEffect(() => {
    async function fetchChatLogs() {
      if (selectedClassId === 'all') {
        // Fetch for first available class or general
        if (classes.length > 0) {
          const res = await fetch(`/api/classroom/chat?meetingId=${encodeURIComponent(classes[0].meeting_code)}`);
          const data = await res.json();
          if (data.success) setMessages(data.messages || []);
        }
      } else {
        const target = classes.find((c) => c.id === selectedClassId);
        const code = target?.meeting_code || selectedClassId;
        const res = await fetch(`/api/classroom/chat?meetingId=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (data.success) setMessages(data.messages || []);
      }
    }
    fetchChatLogs();
  }, [selectedClassId, classes]);

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      m.message.toLowerCase().includes(q) ||
      m.sender_name.toLowerCase().includes(q) ||
      m.meeting_id.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Audit & Compliance Trail
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Class Chat Audit & Transcripts 💬
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search and review all student-teacher in-meeting communications, handwritten solutions, and shared materials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
              {filtered.length} Messages Displayed
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600">Filter By Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Recent Tutoring Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.meeting_code})
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat content or sender name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Chat Log Cards Stream */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recorded Transcript Entries</h3>
            <span className="text-xs text-slate-400 font-mono">Room: {selectedClassId === 'all' ? (classes[0]?.meeting_code || 'General') : selectedClassId}</span>
          </div>

          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {filtered.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-colors ${
                  m.moderation_status === 'flagged' || m.moderation_status === 'blocked'
                    ? 'bg-rose-50/60 border-rose-200'
                    : 'bg-slate-50/80 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{m.sender_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      m.sender_role === 'tutor' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {m.sender_role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.moderation_status === 'flagged' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Flagged</span>
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDate(m.created_at)}
                    </span>
                  </div>
                </div>

                {m.message && (
                  <p className="text-slate-700 leading-relaxed text-xs pt-1">{m.message}</p>
                )}

                {/* Attachments */}
                {m.attachment_url && (
                  <div className="pt-2">
                    {m.message_type === 'image' ? (
                      <div className="inline-block rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.attachment_url}
                          alt="Attachment"
                          onClick={() => setPreviewImage(m.attachment_url || null)}
                          className="h-32 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </div>
                    ) : (
                      <a
                        href={m.attachment_url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-indigo-600 font-semibold"
                      >
                        <FileText className="h-4 w-4" />
                        <span>{m.attachment_name || 'Download Attachment'}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-xs">
                No chat records found matching your selection.
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-2">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImage} alt="Attachment" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
