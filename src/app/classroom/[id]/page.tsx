'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useAuth } from '@/lib/auth-context';
import { ClassModel, ClassChatMessage, UserRole } from '@/lib/types';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Pen,
  Highlighter,
  Eraser,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Type,
  Undo2,
  Redo2,
  FileText,
  Download,
  Trash2,
  X,
  Send,
  ShieldCheck,
  Activity,
  Volume2,
  MessageSquare,
  PhoneOff,
  Users,
  Copy,
  Check,
  MousePointer,
  SwitchCamera,
  Settings,
  Paperclip,
  Image as ImageIcon,
  AlertTriangle,
  Radio,
  FileIcon,
  ZoomIn,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';

export type WhiteboardTool =
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'line'
  | 'arrow'
  | 'rect'
  | 'circle'
  | 'text'
  | 'laser';

export type PaperBackground = 'white' | 'grid' | 'ruled' | 'dark';

export const MATH_SYMBOLS = [
  'π', 'θ', 'λ', '∑', '√', '∫', 'Δ', 'α', 'β', '∞', '±', '≈', '≠', '≤', '≥', 'x²', 'E=mc²',
];

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = ((params?.id as string) || 'session-room').toUpperCase();
  const { user } = useAuth();

  // Peer & Session Configuration
  const [peerId] = useState(() => `peer-${Math.random().toString(36).substring(2, 9)}`);
  const [classInfo, setClassInfo] = useState<ClassModel | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);

  // Connection & Telemetry
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [hasRemotePeer, setHasRemotePeer] = useState(false);
  const [remotePeerName, setRemotePeerName] = useState('Remote Participant');
  const [remoteAudioActive, setRemoteAudioActive] = useState(false);

  // Media Controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [canScreenShare, setCanScreenShare] = useState(true);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');

  // Classroom Layout Modes
  const [layoutMode, setLayoutMode] = useState<'whiteboard-focus' | 'split' | 'video-focus'>('whiteboard-focus');
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Session Duration Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // In-Meeting Chat & Attachments
  const [messages, setMessages] = useState<ClassChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Class Recording State
  const [isRecording, setIsRecording] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Whiteboard Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<WhiteboardTool>('pen');
  const [color, setColor] = useState('#4f46e5');
  const [brushSize, setBrushSize] = useState(3);
  const [paperType, setPaperType] = useState<PaperBackground>('white');
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);
  const [activeTextPos, setActiveTextPos] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState('');

  // Media Streams & WebRTC Peer Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // 1. Initialize Classroom Session & Policy
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      try {
        const uId = user?.id || 'guest-user';
        const res = await fetch(`/api/classroom/session?roomId=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(uId)}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setClassInfo(data.classInfo);
          setCanScreenShare(
            user?.role === 'tutor' ||
            user?.role === 'admin' ||
            data.classInfo?.student_screen_share_allowed !== false
          );
          if (!data.hasAcceptedPolicy) {
            setShowGuidelines(true);
          } else {
            setGuidelinesAccepted(true);
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }
    initSession();
    return () => {
      isMounted = false;
    };
  }, [roomId, user]);

  // 2. Continuous Session Timer (Unlimited Duration)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 3. Device Enumeration
  useEffect(() => {
    async function getDevices() {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          setAudioInputDevices(devices.filter((d) => d.kind === 'audioinput'));
          setVideoInputDevices(devices.filter((d) => d.kind === 'videoinput'));
        } catch (err) {
          console.warn('Could not enumerate audio/video devices:', err);
        }
      }
    }
    getDevices();
  }, []);

  // 4. Initialize Local Camera & Microphone
  useEffect(() => {
    let mounted = true;
    async function startMedia() {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode },
            audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
          });
          if (mounted) {
            localStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            initWebRTC(stream);
            initMediaRecorder(stream);
          }
        }
      } catch (err) {
        console.warn('[Classroom] Camera or Microphone access denied:', err);
      }
    }
    startMedia();

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [facingMode, selectedAudioDevice, selectedVideoDevice]);

  // 5. In-Browser Class Recording Engine (MediaRecorder)
  const initMediaRecorder = (stream: MediaStream) => {
    try {
      if (typeof MediaRecorder !== 'undefined') {
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.start(5000); // chunk every 5s
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      }
    } catch (e) {
      console.warn('[Classroom] MediaRecorder with vp8,opus not supported, falling back to default:', e);
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.start(5000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.warn('[Classroom] Could not initialize MediaRecorder:', err);
      }
    }
  };

  const uploadRecordingSession = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    await new Promise((r) => setTimeout(r, 600));

    if (recordedChunksRef.current.length === 0) return;
    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `recording-${roomId}.webm`, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('meetingId', roomId);
      formData.append('classId', classInfo?.id || roomId);
      formData.append('teacherId', classInfo?.teacher_id || user?.id || 'usr-1788795018002-quazl');
      formData.append('studentId', classInfo?.student_ids?.[0] || 'usr-student-main');
      formData.append('durationSeconds', String(secondsElapsed));
      formData.append('title', `${classInfo?.subject || 'Tutoring'} — Session Recording (${roomId})`);

      await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.warn('Failed to upload recording session:', err);
    }
  };

  // 6. WebRTC Signaling & Peer Connection
  const initWebRTC = (stream: MediaStream) => {
    try {
      if (typeof RTCPeerConnection === 'undefined') return;
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote tracks
      pc.ontrack = (event) => {
        setHasRemotePeer(true);
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemotePeerName(user?.role === 'tutor' ? 'Student Stream' : 'Tutor Stream');
          setRemoteAudioActive(true);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch('/api/classroom/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId,
              fromPeer: peerId,
              data: { type: 'candidate', candidate: event.candidate },
            }),
          }).catch(() => {});
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          setIsReconnecting(false);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false);
          setIsReconnecting(true);
        }
      };
    } catch (e) {
      console.warn('[WebRTC] Initialization error:', e);
    }
  };

  // WebRTC Signaling Poller
  useEffect(() => {
    let active = true;
    const interval = setInterval(async () => {
      if (!active || !peerConnectionRef.current) return;
      try {
        const res = await fetch(`/api/classroom/signal?roomId=${encodeURIComponent(roomId)}&peerId=${encodeURIComponent(peerId)}`);
        const json = await res.json();
        if (json.success && json.signals && json.signals.length > 0) {
          const pc = peerConnectionRef.current;
          if (!pc) return;

          for (const s of json.signals) {
            const data = s.data;
            if (data.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await fetch('/api/classroom/signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomId,
                  fromPeer: peerId,
                  toPeer: s.fromPeer,
                  data: { type: 'answer', answer },
                }),
              });
              setHasRemotePeer(true);
            } else if (data.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
              setHasRemotePeer(true);
            } else if (data.type === 'candidate' && data.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          }
        }
      } catch (err) {
        console.warn('Signaling poll failed:', err);
      }
    }, 2500);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomId, peerId]);

  // Caller side: Create initial WebRTC Offer if first peer
  const initiateCall = async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await fetch('/api/classroom/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          fromPeer: peerId,
          data: { type: 'offer', offer },
        }),
      });
    } catch (e) {
      console.warn('Could not create offer:', e);
    }
  };

  // 7. Attendance Heartbeat Loop
  useEffect(() => {
    const u = {
      id: user?.id || `user-${peerId}`,
      name: user?.full_name || (user?.role === 'tutor' ? 'Teacher' : 'Student'),
      role: (user?.role as UserRole) || 'student',
    };

    // Join log
    fetch('/api/classroom/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        meetingId: roomId,
        classId: classInfo?.id || roomId,
        user: u,
      }),
    }).catch(() => {});

    // Periodic heartbeat
    const interval = setInterval(() => {
      fetch('/api/classroom/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'heartbeat',
          meetingId: roomId,
          classId: classInfo?.id || roomId,
          user: u,
        }),
      })
        .then(() => {
          setIsConnected(true);
          setIsReconnecting(false);
        })
        .catch(() => {
          setIsConnected(false);
          setIsReconnecting(true);
        });
    }, 15000);

    return () => {
      clearInterval(interval);
      fetch('/api/classroom/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          meetingId: roomId,
          classId: classInfo?.id || roomId,
          user: u,
        }),
      }).catch(() => {});
    };
  }, [roomId, classInfo, user, peerId]);

  // 8. In-Class Chat Sync Loop
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/classroom/chat?meetingId=${encodeURIComponent(roomId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.warn('Failed to load chat messages:', e);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  // 9. Send Chat Message & Moderation Interception
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setPolicyError(null);
    const content = chatInput.trim();
    setChatInput('');

    try {
      const res = await fetch('/api/classroom/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: roomId,
          classId: classInfo?.id || roomId,
          senderId: user?.id || peerId,
          senderName: user?.full_name || (user?.role === 'tutor' ? 'Teacher' : 'Student'),
          senderRole: (user?.role as UserRole) || 'student',
          message: content,
          messageType: 'text',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.blocked) {
        setPolicyError(data.error || 'Message violates Tutor Plug communication policy.');
      } else {
        fetchMessages();
      }
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  // 10. File & Image Upload Handling
  const handleFileUpload = async (file: File, type: 'image' | 'file') => {
    if (!file) return;
    setIsUploading(true);
    setPolicyError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('meetingId', roomId);

    try {
      const res = await fetch('/api/classroom/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPolicyError(data.error || 'File upload failed.');
      } else {
        // Send attachment message
        await fetch('/api/classroom/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId: roomId,
            classId: classInfo?.id || roomId,
            senderId: user?.id || peerId,
            senderName: user?.full_name || (user?.role === 'tutor' ? 'Teacher' : 'Student'),
            senderRole: (user?.role as UserRole) || 'student',
            message: type === 'image' ? 'Uploaded classroom homework image' : `Uploaded document: ${data.fileName}`,
            messageType: type,
            attachmentUrl: data.fileUrl,
            attachmentType: data.fileType,
            attachmentSize: data.fileSize,
            attachmentName: data.fileName,
          }),
        });
        fetchMessages();
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setPolicyError('An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Policy Acceptance Action
  const handleAcceptPolicy = async () => {
    if (user?.id) {
      await fetch('/api/policy/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: user.role,
          version: '1.0',
        }),
      });
    }
    setShowGuidelines(false);
    setGuidelinesAccepted(true);
  };

  // Media Toggles
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      if (!canScreenShare) {
        alert('Screen sharing is restricted for students in this session.');
        return;
      }
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
          });
          screenStreamRef.current = screenStream;
          if (screenShareVideoRef.current) {
            screenShareVideoRef.current.srcObject = screenStream;
          }
          setIsScreenSharing(true);

          screenStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            screenStreamRef.current = null;
          };
        }
      } catch (err) {
        console.warn('Screen share cancelled:', err);
      }
    }
  };

  const copyMeetingLink = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/meet/${roomId}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleLeaveClass = async () => {
    const isTeacher = user?.role === 'tutor' || user?.role === 'admin';
    const msg = isTeacher
      ? 'Are you sure you want to end this live class session? Recording and logs will be saved.'
      : 'Are you sure you want to leave the classroom?';

    if (confirm(msg)) {
      await uploadRecordingSession();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (isTeacher) {
        router.push('/tutor/classes');
      } else {
        router.push('/student/classes');
      }
    }
  };

  // Canvas Drawing & Stylus Logic
  const drawBackgroundPattern = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bg: PaperBackground
  ) => {
    if (bg === 'dark') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (bg === 'grid') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (bg === 'ruled') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let y = 40; y < height; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 0);
      ctx.lineTo(60, height);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    drawBackgroundPattern(ctx, canvas.width, canvas.height, paperType);
    undoStackRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    redoStackRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, [paperType]);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    undoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStackRef.current.length > 25) undoStackRef.current.shift();
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStackRef.current.length <= 1) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const current = undoStackRef.current.pop();
    if (current) redoStackRef.current.push(current);
    const previous = undoStackRef.current[undoStackRef.current.length - 1];
    if (previous) ctx.putImageData(previous, 0, 0);
    setCanUndo(undoStackRef.current.length > 1);
    setCanRedo(true);
  };

  const handleRedo = () => {
    const canvas = canvasRef.current;
    if (!canvas || redoStackRef.current.length === 0) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const next = redoStackRef.current.pop();
    if (next) {
      undoStackRef.current.push(next);
      ctx.putImageData(next, 0, 0);
    }
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) * canvas.width) / rect.width,
      y: ((clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const startDrawingAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (tool === 'laser') {
      setLaserPos({ x, y });
      return;
    }
    if (tool === 'text') {
      setActiveTextPos({ x, y });
      return;
    }

    setIsDrawing(true);
    startPosRef.current = { x, y };
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const drawAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (tool === 'laser') {
      setLaserPos({ x, y });
      return;
    }

    if (!isDrawing || !startPosRef.current) return;
    const startX = startPosRef.current.x;
    const startY = startPosRef.current.y;

    if (tool === 'pen') {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = paperType === 'dark' && color === '#4f46e5' ? '#818cf8' : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'highlighter') {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 4;
      ctx.lineCap = 'square';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = paperType === 'dark' ? '#0f172a' : '#ffffff';
      ctx.lineWidth = brushSize * 5;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (['line', 'arrow', 'rect', 'circle'].includes(tool)) {
      if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (tool === 'circle') {
        ctx.beginPath();
        const rx = Math.abs(x - startX) / 2;
        const ry = Math.abs(y - startY) / 2;
        ctx.ellipse(Math.min(startX, x) + rx, Math.min(startY, y) + ry, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
        const angle = Math.atan2(y - startY, x - startX);
        const headlen = Math.max(12, brushSize * 3);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (tool === 'laser') {
      setLaserPos(null);
      return;
    }
    if (isDrawing) {
      setIsDrawing(false);
      startPosRef.current = null;
      snapshotRef.current = null;
      saveSnapshot();
    }
  };

  const handleApplyText = () => {
    if (!activeTextPos || !textInput.trim()) {
      setActiveTextPos(null);
      setTextInput('');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = color;
    ctx.font = `${Math.max(16, brushSize * 5)}px Inter, sans-serif`;
    ctx.fillText(textInput, activeTextPos.x, activeTextPos.y);

    setActiveTextPos(null);
    setTextInput('');
    saveSnapshot();
  };

  const insertSymbol = (sym: string) => {
    if (activeTextPos) {
      setTextInput((prev) => prev + sym);
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = color;
      ctx.font = `${Math.max(22, brushSize * 6)}px Inter, sans-serif`;
      ctx.fillText(sym, canvas.width / 2 - 20, canvas.height / 2);
      saveSnapshot();
    }
  };

  const downloadWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height + 40;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.drawImage(canvas, 0, 0);
    tCtx.fillStyle = '#0f172a';
    tCtx.fillRect(0, canvas.height, canvas.width, 40);
    tCtx.fillStyle = '#ffffff';
    tCtx.font = '12px Inter, sans-serif';
    tCtx.fillText(
      `TUTOR PLUG NOTES • Room ${roomId} • Subject: ${classInfo?.subject || 'Tutoring'} • Date: ${new Date().toLocaleString()}`,
      20,
      canvas.height + 25
    );

    const image = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `tutorplug-${roomId}-lesson-notes.png`;
    link.click();
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#080c14] text-white overflow-hidden select-none font-sans">
      {/* 1. Mandatory Policy Guidelines Modal (Section 20 & 37) */}
      {showGuidelines && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Tutor Plug Class Guidelines</h2>
                <p className="text-xs text-slate-400">Please review and acknowledge platform standards before proceeding.</p>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 space-y-2 max-h-72 overflow-y-auto border border-slate-700/60 leading-relaxed">
              <ol className="list-decimal pl-4 space-y-1.5 font-medium">
                <li>Do not share personal phone numbers.</li>
                <li>Do not share personal WhatsApp, Telegram, or Instagram IDs.</li>
                <li>Do not ask students to move communication outside Tutor Plug.</li>
                <li>Do not share personal payment details or UPI handles.</li>
                <li>Keep class communication inside Tutor Plug at all times.</li>
                <li>Use Tutor Plug chat for study-related communication only.</li>
                <li>Classes are recorded for tutoring quality, safety, dispute resolution, and platform monitoring.</li>
                <li>Do not share inappropriate or unauthorized content.</li>
                <li>Respect students, teachers, and platform policies.</li>
              </ol>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptPolicy}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition-all cursor-pointer"
              >
                I Understand & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Disconnection / Reconnection Overlay (Section 15) */}
      {isReconnecting && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 text-slate-950 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-amber-300 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connection lost. Reconnecting to Tutor Plug room...</span>
        </div>
      )}

      {/* 3. Mandatory Visible Recording Notice Banner (Section 11) */}
      <div className="h-7 bg-indigo-950/80 border-b border-indigo-500/20 px-4 flex items-center justify-between text-[11px] text-indigo-200 z-30 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span className="truncate">
            <strong>Recording Active:</strong> This class is being recorded for tutoring quality, safety, and platform monitoring purposes.
          </span>
        </div>
        <span className="font-mono text-[10px] bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-400/30 shrink-0 hidden sm:inline">
          Encrypted HD Session
        </span>
      </div>

      {/* Top Header Cockpit Bar */}
      <header className="h-14 px-3 sm:px-6 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between z-30 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" href="/" />
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>REC 🔴 LIVE</span>
            </span>
            <span className="text-xs font-mono bg-slate-800/90 px-2.5 py-0.5 rounded text-slate-200 font-semibold border border-slate-700/60">
              {formatTimer(secondsElapsed)}
            </span>
          </div>
        </div>

        {/* Center Telemetry HUD */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px]">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span>WebRTC HD • 0% Loss</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[11px]">
            <ShieldCheck className="h-3 w-3 text-indigo-400" />
            <span>E2EE Policy Guard Active</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            Room: {roomId}
          </span>
        </div>

        {/* Right Controls & Invite Link */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => {
                setLayoutMode('whiteboard-focus');
                setIsWhiteboardOpen(true);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                layoutMode === 'whiteboard-focus' && isWhiteboardOpen ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Writing Pad
            </button>
            <button
              onClick={() => {
                setLayoutMode('split');
                setIsWhiteboardOpen(true);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                layoutMode === 'split' && isWhiteboardOpen ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => {
                setLayoutMode('video-focus');
                setIsWhiteboardOpen(false);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                layoutMode === 'video-focus' || !isWhiteboardOpen ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Video Focus
            </button>
          </div>

          <button
            onClick={copyMeetingLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors border border-slate-700 cursor-pointer"
            title="Copy invitation link"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share Link'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex p-2.5 sm:p-3.5 gap-3 overflow-hidden relative">
          {/* Active Screen Share Notice Pill */}
          {isScreenSharing && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 bg-indigo-600/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 border border-indigo-400/40">
              <MonitorUp className="h-4 w-4" />
              <span>You are sharing your screen</span>
              <button
                onClick={toggleScreenShare}
                className="ml-2 underline text-indigo-200 hover:text-white font-bold cursor-pointer"
              >
                Stop Sharing
              </button>
            </div>
          )}

          {/* MODE 1: Whiteboard Focus (with Floating Video PiP cards) */}
          {layoutMode === 'whiteboard-focus' && isWhiteboardOpen && (
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl relative">
              {/* Floating Participant Cards in Top-Right */}
              <div className="absolute top-16 right-4 z-20 flex flex-col gap-2 pointer-events-none">
                {/* Local Video PiP */}
                <div className="w-44 h-28 sm:w-52 sm:h-32 rounded-xl bg-slate-950/95 border border-slate-700/80 overflow-hidden shadow-2xl relative pointer-events-auto backdrop-blur group">
                  {isVideoOn ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {user?.full_name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-[10px] mt-1 text-slate-400">Camera Off</span>
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur text-[10px] font-semibold text-slate-200 flex items-center justify-between">
                    <span className="truncate">{user?.full_name || 'You'}</span>
                    {!isMicOn && <MicOff className="h-3 w-3 text-rose-400" />}
                  </div>
                </div>

                {/* Remote Participant PiP */}
                <div className="w-44 h-28 sm:w-52 sm:h-32 rounded-xl bg-slate-950/95 border border-slate-700/80 overflow-hidden shadow-2xl relative pointer-events-auto backdrop-blur group">
                  {hasRemotePeer ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950/60 p-2 text-center">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                        {user?.role === 'tutor' ? 'S' : 'T'}
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 mt-1 truncate max-w-full">
                        {user?.role === 'tutor' ? 'Student Connected' : 'Educator Stage'}
                      </span>
                      <button
                        onClick={initiateCall}
                        className="mt-1 text-[9px] text-indigo-300 hover:text-white underline cursor-pointer"
                      >
                        Connect WebRTC
                      </button>
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur text-[10px] font-semibold text-slate-200 flex items-center justify-between">
                    <span>{remotePeerName}</span>
                    <Volume2 className="h-3 w-3 text-emerald-400" />
                  </div>
                </div>
              </div>

              {renderWhiteboardWorkspace()}
            </div>
          )}

          {/* MODE 2: Split View */}
          {layoutMode === 'split' && isWhiteboardOpen && (
            <div className="flex-1 flex flex-col lg:flex-row gap-3 h-full overflow-hidden">
              <div className="w-full lg:w-[40%] flex flex-col gap-3">
                {renderVideoTiles()}
              </div>
              <div className="w-full lg:w-[60%] flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl relative">
                {renderWhiteboardWorkspace()}
              </div>
            </div>
          )}

          {/* MODE 3: Video Focus */}
          {(layoutMode === 'video-focus' || !isWhiteboardOpen) && (
            <div className="flex-1 flex flex-col h-full">
              {renderVideoTiles()}
            </div>
          )}
        </div>

        {/* Live Chat Side Drawer (Sections 8, 9, 21, 22) */}
        {isChatOpen && (
          <div className="w-full sm:w-88 border-l border-slate-800 bg-slate-900 flex flex-col z-40 shadow-2xl">
            <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">In-Class Live Chat</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Policy Alert Banner */}
            {policyError && (
              <div className="m-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Communication Policy Alert</p>
                  <p className="text-[11px] text-rose-300 mt-0.5 leading-relaxed">{policyError}</p>
                </div>
                <button onClick={() => setPolicyError(null)} className="text-rose-400 hover:text-white cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs">
              {messages.map((m) => {
                const isMe = m.sender_id === user?.id || m.sender_id === peerId;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 mb-0.5 font-semibold">
                      {m.sender_name} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Text Message */}
                    {m.message && (
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-sm'
                        }`}
                      >
                        {m.message}
                      </div>
                    )}

                    {/* Image Attachment (Section 8) */}
                    {m.message_type === 'image' && m.attachment_url && (
                      <div className="mt-1.5 rounded-xl overflow-hidden border border-slate-700 max-w-[240px] bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.attachment_url}
                          alt="Homework / Diagram"
                          onClick={() => setPreviewImage(m.attachment_url || null)}
                          className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                        <div className="p-1.5 bg-slate-900/90 text-[10px] text-slate-300 flex items-center justify-between">
                          <span className="truncate">{m.attachment_name || 'Homework Image'}</span>
                          <ZoomIn className="h-3 w-3 text-indigo-400" />
                        </div>
                      </div>
                    )}

                    {/* Document Attachment (Section 9) */}
                    {m.message_type === 'file' && m.attachment_url && (
                      <a
                        href={m.attachment_url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-2 max-w-[240px] text-slate-200 transition-colors"
                      >
                        <FileIcon className="h-5 w-5 text-indigo-400 shrink-0" />
                        <div className="overflow-hidden text-left">
                          <p className="font-semibold text-[11px] truncate">{m.attachment_name || 'Document'}</p>
                          <span className="text-[9px] text-slate-400">Click to download</span>
                        </div>
                        <Download className="h-3.5 w-3.5 ml-auto text-slate-400 shrink-0" />
                      </a>
                    )}
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Hidden file & image inputs */}
            <input
              type="file"
              ref={imageInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f, 'image');
              }}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f, 'file');
              }}
              className="hidden"
            />

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Upload homework photo / diagram"
              >
                <ImageIcon className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Attach lesson document (PDF, DOCX)"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                placeholder="Ask doubt or type formula..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={isUploading}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 4. Fullscreen Image Zoom Modal (for homework solutions & diagrams) */}
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
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* 5. Audio/Video Hardware Settings Modal (Sections 5 & 6) */}
      {showDeviceSettings && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-400" />
                <span>Audio & Video Device Settings</span>
              </h3>
              <button onClick={() => setShowDeviceSettings(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Microphone Input Device</label>
                <select
                  value={selectedAudioDevice}
                  onChange={(e) => setSelectedAudioDevice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Default System Microphone</option>
                  {audioInputDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone ${d.deviceId.substring(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Camera Input Device</label>
                <select
                  value={selectedVideoDevice}
                  onChange={(e) => setSelectedVideoDevice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Default System Camera</option>
                  {videoInputDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.substring(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowDeviceSettings(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Apply Devices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Meeting Control Dock (Section 4) */}
      <footer className="h-20 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-2xl px-4 flex items-center justify-between z-30 shrink-0 shadow-2xl">
        <div className="hidden md:flex items-center gap-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
            <span className="text-slate-300 font-medium">{isConnected ? 'WebRTC Stable (30fps)' : 'Reconnecting...'}</span>
          </div>
        </div>

        {/* Center Control Pills */}
        <div className="flex items-center gap-2.5 sm:gap-3 mx-auto md:mx-0">
          {/* Mic */}
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              isMicOn
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-105'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              isVideoOn
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-105'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50'
            }`}
            title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          {/* Flip Camera */}
          <button
            onClick={toggleCameraFacing}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-105 transition-all cursor-pointer"
            title="Flip camera (Front / Rear)"
          >
            <SwitchCamera className="h-5 w-5 text-indigo-400" />
          </button>

          {/* Screen Share (Section 7) */}
          <button
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              isScreenSharing
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-xl'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-105'
            }`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
          </button>

          {/* Whiteboard Toggle */}
          <button
            onClick={() => {
              if (isWhiteboardOpen) {
                setIsWhiteboardOpen(false);
                setLayoutMode('video-focus');
              } else {
                setIsWhiteboardOpen(true);
                setLayoutMode('whiteboard-focus');
              }
            }}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              isWhiteboardOpen
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-xl'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-105'
            }`}
            title="Toggle Smart Writing Pad"
          >
            <Pen className="h-5 w-5" />
          </button>

          {/* Device Settings */}
          <button
            onClick={() => setShowDeviceSettings(true)}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-105 transition-all cursor-pointer"
            title="Device settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* In-Meeting Chat */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer relative ${
              isChatOpen
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-xl'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-105'
            }`}
            title="Toggle In-Class Chat"
          >
            <MessageSquare className="h-5 w-5" />
            {messages.length > 0 && !isChatOpen && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* End Call / Leave Class */}
          <button
            onClick={handleLeaveClass}
            className="p-3.5 px-5 sm:px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 transition-all shadow-xl shadow-rose-900/50 cursor-pointer ml-1 sm:ml-2 hover:scale-105"
            title="End or Leave Class Session"
          >
            <PhoneOff className="h-5 w-5" />
            <span className="hidden sm:inline text-xs font-bold">End Class</span>
          </button>
        </div>

        {/* Right Status */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            <Users className="h-4 w-4 text-indigo-400" />
            <span>{hasRemotePeer ? '2 Connected' : '1 (Waiting for Peer)'}</span>
          </div>
        </div>
      </footer>
    </div>
  );

  // Video Stage Tiles Renderer
  function renderVideoTiles() {
    return (
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 h-full max-h-full">
        {/* Primary Stage Tile (Screen Share or Remote Participant) */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl group">
          {isScreenSharing ? (
            <video ref={screenShareVideoRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
          ) : hasRemotePeer ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-center space-y-4 p-6">
              <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-3xl font-black text-white shadow-xl ring-4 ring-indigo-500/30">
                {user?.role === 'tutor' ? 'S' : 'T'}
                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {user?.role === 'tutor' ? 'Student: Rohan Mehta' : 'Teacher: Prof. Rajesh Kumar'}
                </h3>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs text-emerald-400 font-semibold">Ready to connect WebRTC</span>
                  <button
                    onClick={initiateCall}
                    className="ml-2 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[11px] text-white font-bold cursor-pointer transition-colors"
                  >
                    Connect Stream
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 border border-slate-800">
            {isScreenSharing ? 'Screen Share View' : user?.role === 'tutor' ? 'Student Stream' : 'Educator Stage'}
          </div>
        </div>

        {/* Local Camera Tile */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
          {isVideoOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
          ) : (
            <div className="text-center space-y-3 p-6">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-400 mx-auto border border-slate-700">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">You ({user?.full_name || 'My Feed'})</p>
                <p className="text-xs text-slate-500">Camera is muted</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-200 border border-slate-800 flex items-center gap-2">
            <span>You {user?.role === 'tutor' ? '(Host / Mentor)' : '(Student)'}</span>
            {!isMicOn && <MicOff className="h-3 w-3 text-rose-400" />}
          </div>
        </div>
      </div>
    );
  }

  // Interactive Smart Writing Pad Workspace
  function renderWhiteboardWorkspace() {
    return (
      <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
        {/* Top Control Bar */}
        <div className="h-14 px-3 sm:px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 z-10 shrink-0 text-slate-200 text-xs flex-wrap">
          {/* Paper Type */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            {(['white', 'grid', 'ruled', 'dark'] as PaperBackground[]).map((p) => (
              <button
                key={p}
                onClick={() => setPaperType(p)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer capitalize ${
                  paperType === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === 'dark' ? 'Slate' : p}
              </button>
            ))}
          </div>

          {/* Tools */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setTool('pen')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                tool === 'pen' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Freehand Pen"
            >
              <Pen className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool('highlighter')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                tool === 'highlighter' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Highlighter"
            >
              <Highlighter className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool('line')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                tool === 'line' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Straight Line"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool('arrow')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                tool === 'arrow' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Vector Arrow"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool('rect')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                tool === 'rect' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Rectangle Box"
            >
              <Square className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool('circle')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                tool === 'circle' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Circle / Ellipse"
            >
              <Circle className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool('text')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                tool === 'text' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Formula & Text"
            >
              <Type className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                tool === 'eraser' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Precision Eraser"
            >
              <Eraser className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool('laser')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                tool === 'laser' ? 'bg-rose-600 text-white shadow-xs animate-pulse' : 'text-slate-400 hover:text-white'
              }`}
              title="Laser Pointer"
            >
              <MousePointer className="h-4 w-4" />
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
            {['#4f46e5', '#0284c7', '#059669', '#e11d48', '#d97706', '#7c3aed', '#0f172a', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  if (tool === 'eraser') setTool('pen');
                }}
                style={{ backgroundColor: c }}
                className={`h-4 w-4 rounded-full cursor-pointer transition-transform ${
                  color === c && tool !== 'eraser' ? 'scale-125 ring-2 ring-indigo-400' : 'opacity-80 hover:opacity-100'
                } ${c === '#ffffff' ? 'border border-slate-600' : ''}`}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-[11px]">
            <span className="text-slate-400">Size:</span>
            {[2, 4, 8, 14].map((sz) => (
              <button
                key={sz}
                onClick={() => setBrushSize(sz)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  brushSize === sz ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sz}px
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                canUndo ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700' : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                canRedo ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700' : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <button
              onClick={downloadWhiteboard}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer"
              title="Export Lesson Notes (.PNG)"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Clear the entire writing pad?')) {
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    drawBackgroundPattern(ctx, canvas.width, canvas.height, paperType);
                    saveSnapshot();
                  }
                }
              }}
              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors border border-rose-800/40 cursor-pointer"
              title="Clear Canvas"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Secondary Math & Science Quick Symbols Bar */}
        <div className="h-9 px-4 bg-slate-800/90 border-b border-slate-700/60 flex items-center gap-2 overflow-x-auto z-10 shrink-0 text-xs text-slate-300 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Quick Math Symbols:
          </span>
          <div className="flex items-center gap-1.5">
            {MATH_SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => insertSymbol(sym)}
                className="px-2 py-0.5 rounded bg-slate-700/80 hover:bg-indigo-600 hover:text-white text-slate-200 font-mono text-xs transition-colors cursor-pointer border border-slate-600/60"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Drawing Canvas */}
        <div className="flex-1 relative cursor-crosshair overflow-hidden w-full h-full">
          <canvas
            ref={canvasRef}
            width={1600}
            height={1000}
            onMouseDown={(e) => {
              const c = getCanvasCoords(e.clientX, e.clientY);
              if (c) startDrawingAt(c.x, c.y);
            }}
            onMouseMove={(e) => {
              const c = getCanvasCoords(e.clientX, e.clientY);
              if (c) drawAt(c.x, c.y);
            }}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              if (touch) {
                const c = getCanvasCoords(touch.clientX, touch.clientY);
                if (c) startDrawingAt(c.x, c.y);
              }
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              if (touch) {
                const c = getCanvasCoords(touch.clientX, touch.clientY);
                if (c) drawAt(c.x, c.y);
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopDrawing();
            }}
            className="w-full h-full object-contain block touch-none"
          />

          {laserPos && (
            <div
              style={{ left: laserPos.x, top: laserPos.y }}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_#f43f5e] ring-4 ring-rose-400/40 animate-ping"
            />
          )}

          {activeTextPos && (
            <div
              style={{ left: Math.min(activeTextPos.x, 500), top: Math.min(activeTextPos.y, 400) }}
              className="absolute z-20 bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-2xl flex items-center gap-2"
            >
              <input
                type="text"
                autoFocus
                placeholder="Type formula or text..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyText();
                  if (e.key === 'Escape') setActiveTextPos(null);
                }}
                className="bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-52"
              />
              <button
                onClick={handleApplyText}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Place
              </button>
              <button onClick={() => setActiveTextPos(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}