'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ClassModel, AttendanceRecord, ClassChatMessage, RecordingRecord, PolicyViolation } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Video,
  Clock,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  ShieldAlert,
  Download,
  ExternalLink,
  Play,
  Pause,
  Maximize2,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  X,
} from 'lucide-react';

export default function AdminClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = (params?.id as string) || '';

  const [classInfo, setClassInfo] = useState<ClassModel | null>(null);
  const [meeting, setMeeting] = useState<any>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ClassChatMessage[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'recording' | 'chat' | 'attendance' | 'files' | 'policy'>('overview');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Video Player Controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function loadDetails() {
      if (!classId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/classes/${encodeURIComponent(classId)}`);
        const data = await res.json();
        if (data.success) {
          setClassInfo(data.classInfo);
          setMeeting(data.meeting);
          setAttendance(data.attendance || []);
          setChatMessages(data.chatMessages || []);
          setSharedFiles(data.sharedFiles || []);
          setRecordings(data.recordings || []);
          setViolations(data.violations || []);
        }
      } catch (err) {
        console.error('Failed to load class details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [classId]);

  const activeRecording = recordings[0] || null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/classes" className="hover:text-indigo-600 flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Classes</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{classInfo?.meeting_code || classId}</span>
        </div>

        {/* Master Session Summary Hero (Section 23 & 34) */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-500/30">
                  SESSION #{classInfo?.meeting_code}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    classInfo?.status === 'live'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : classInfo?.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {classInfo?.status}
                </span>
                {violations.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {violations.length} Policy Flag{violations.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{classInfo?.title}</h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Subject: <strong className="text-white">{classInfo?.subject}</strong> • Teacher:{' '}
                <strong className="text-white">{classInfo?.teacher?.full_name || 'Assigned Tutor'}</strong> • Student:{' '}
                <strong className="text-white">
                  {classInfo?.students?.[0]?.full_name || 'Enrolled Student'}
                </strong>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link href={`/classroom/${classInfo?.meeting_code}`} target="_blank">
                <Button variant="gradient" size="md" leftIcon={<ExternalLink className="h-4 w-4" />}>
                  Enter Live Classroom
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Scheduled</span>
              <span className="font-semibold text-white mt-0.5 block">{formatDate(classInfo?.scheduled_start || '')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Duration</span>
              <span className="font-semibold text-white mt-0.5 block">{classInfo?.duration_minutes} Minutes</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Recording</span>
              <span className={`font-semibold mt-0.5 block ${activeRecording ? 'text-emerald-400' : 'text-slate-400'}`}>
                {activeRecording ? 'Available' : 'Recording / Pending'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Chat History</span>
              <span className="font-semibold text-white mt-0.5 block">{chatMessages.length} Messages</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Participants</span>
              <span className="font-semibold text-white mt-0.5 block">{attendance.length || 2} Logged</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs (Section 34) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/90 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('recording')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'recording' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            <span>Watch Recording</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>View Chat ({chatMessages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Attendance Log ({attendance.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'files' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Shared Files ({sharedFiles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'policy' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Policy Flags ({violations.length})</span>
          </button>
        </div>

        {/* TAB 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900">Class & Curriculum Metadata</h3>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Class ID:</span>
                  <span className="font-mono text-slate-900">{classInfo?.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Meeting Room Code:</span>
                  <span className="font-mono font-bold text-indigo-600">{classInfo?.meeting_code}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Subject:</span>
                  <span className="font-bold text-slate-900">{classInfo?.subject}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Scheduled Duration:</span>
                  <span>{classInfo?.duration_minutes} Minutes</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Mandatory Recording:</span>
                  <Badge variant="verified">Enforced</Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Student Screen Sharing:</span>
                  <span>{classInfo?.student_screen_share_allowed ? 'Permitted' : 'Restricted'}</span>
                </div>
                <div className="py-2">
                  <span className="text-slate-400 block mb-1">Curriculum / Topic Notes:</span>
                  <p className="bg-slate-50 p-3 rounded-xl text-slate-600 leading-relaxed">
                    {classInfo?.notes || 'Standard curriculum session.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900">Instructor & Student Roster</h3>
              <div className="space-y-4">
                {/* Teacher Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {classInfo?.teacher?.full_name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 block">Instructor</span>
                    <p className="text-sm font-bold text-slate-900">{classInfo?.teacher?.full_name || 'Prof. Rajesh Kumar'}</p>
                    <span className="text-[11px] text-slate-500 font-mono">{classInfo?.teacher?.phone}</span>
                  </div>
                </div>

                {/* Student Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {classInfo?.students?.[0]?.full_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">Student</span>
                    <p className="text-sm font-bold text-slate-900">{classInfo?.students?.[0]?.full_name || 'Rohan Mehta'}</p>
                    <span className="text-[11px] text-slate-500 font-mono">{classInfo?.students?.[0]?.phone}</span>
                  </div>
                </div>

                {/* Policy Violations Summary */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-950">
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                    <span>Communication Compliance Status</span>
                  </p>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    {violations.length === 0
                      ? 'No off-platform contact sharing violations detected during this tutoring session.'
                      : `${violations.length} contact sharing attempt(s) intercepted by Tutor Plug automated moderation.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Watch Recording (Section 13) */}
        {activeTab === 'recording' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Encrypted Class Recording</h2>
                <p className="text-xs text-slate-500">
                  Playback captured video, audio, screen shares, and writing pad notes.
                </p>
              </div>

              {activeRecording && (
                <a
                  href={`/api/recordings/stream?id=${activeRecording.id}`}
                  download={`recording-${classInfo?.meeting_code}.webm`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Recording</span>
                </a>
              )}
            </div>

            {/* Custom High-Tech Video Player */}
            <div className="relative rounded-3xl bg-slate-950 overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
              {activeRecording ? (
                <video
                  ref={videoRef}
                  src={`/api/recordings/stream?id=${activeRecording.id}`}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <Video className="h-12 w-12 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-white">Recording Processing or In-Session</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Live classroom recordings are uploaded and indexed automatically upon class completion.
                  </p>
                </div>
              )}
            </div>

            {/* Playback Controls & Speed Options */}
            <div className="flex items-center justify-between gap-3 text-xs flex-wrap pt-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Playback Speed:</span>
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                      playbackSpeed === spd ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <div className="text-slate-400 font-mono text-xs">
                Retention Policy: 90 Days Secure Storage
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: View Chat Transcript (Section 10) */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Official Meeting Chat History</h3>
                <p className="text-xs text-slate-500">
                  Persistent transcript of all messages and file metadata exchanged during this session.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600">{chatMessages.length} Messages Recorded</span>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {chatMessages.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {m.sender_name} <span className="text-[10px] text-slate-400">({m.sender_role})</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed pt-1">{m.message}</p>

                  {m.attachment_url && (
                    <div className="pt-2">
                      {m.message_type === 'image' ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={m.attachment_url}
                          alt="Attachment"
                          onClick={() => setPreviewImage(m.attachment_url || null)}
                          className="h-28 w-auto rounded-xl object-cover border border-slate-200 cursor-pointer"
                        />
                      ) : (
                        <a
                          href={m.attachment_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-indigo-600 font-semibold"
                        >
                          <FileText className="h-4 w-4" />
                          <span>{m.attachment_name || 'Download Attachment'}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {chatMessages.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No chat messages were recorded for this session.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Attendance Log (Section 25) */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Participant Attendance & Telemetry Logs</h3>
              <p className="text-xs text-slate-500">
                Exact join/leave timestamps, total participation time, and network reconnection incidents.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Participant</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Joined Time</th>
                    <th className="px-6 py-3.5">Leave Time</th>
                    <th className="px-6 py-3.5">Total Duration</th>
                    <th className="px-6 py-3.5">Reconnections</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-bold text-slate-900">{att.user_name}</td>
                      <td className="px-6 py-4">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {att.user_role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{formatDate(att.joined_at)}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {att.left_at ? formatDate(att.left_at) : 'Active In Class'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {Math.floor(att.duration_seconds / 60)}m {att.duration_seconds % 60}s
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold">{att.reconnection_count} times</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Shared Files */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Educational Documents & Shared Images</h3>
              <p className="text-xs text-slate-500">Homework files, diagrams, and formulas shared inside the meeting.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sharedFiles.map((f, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Uploaded by {f.senderName}</p>
                  <a
                    href={f.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline pt-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download File</span>
                  </a>
                </div>
              ))}

              {sharedFiles.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  No files were uploaded during this class session.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Policy Violations (Section 22) */}
        {activeTab === 'policy' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Policy Flags for this Class</h3>
              <p className="text-xs text-slate-500">
                Automated detection of phone numbers, emails, and off-platform solicitation.
              </p>
            </div>

            <div className="p-6 space-y-3">
              {violations.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 text-sm">{v.user_name} ({v.user_role})</span>
                    <span className="font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {v.category} (Confidence: {Math.round(v.confidence * 100)}%)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-rose-200 font-mono text-[11px] text-slate-800">
                    &quot;{v.message_snippet}&quot;
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-1 text-[11px]">
                    <span>Status: {v.status}</span>
                    <span>Action Taken: {v.admin_action}</span>
                  </div>
                </div>
              ))}

              {violations.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Zero policy flags recorded. Classroom communication complied with all Tutor Plug guidelines.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fullscreen Image Preview */}
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
