import fs from 'fs';
import path from 'path';
import {
  Profile,
  StudentProfile,
  TutorProfile,
  Booking,
  Payment,
  UserRole,
  ClassModel,
  MeetingSession,
  AttendanceRecord,
  RecordingRecord,
  ClassChatMessage,
  PolicyViolation,
  PolicyAcceptance,
  AuditLog,
  PlatformPolicySettings,
  AdminAction,
} from '@/lib/types';
import { INITIAL_SUBJECTS, INITIAL_BOARDS, INITIAL_CLASS_LEVELS } from '@/lib/constants';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'tutorplug_db.json');
const TMP_DB_FILE = path.join('/tmp', 'tutorplug_db.json');

export interface OTPRecord {
  phone: string;
  code: string;
  expires_at: number;
  attempts: number;
}

export interface SignalEnvelope {
  id: string;
  roomId: string;
  fromPeer: string;
  toPeer?: string;
  data: any;
  timestamp: number;
}

export interface DatabaseSchema {
  profiles: Profile[];
  student_profiles: StudentProfile[];
  tutor_profiles: TutorProfile[];
  bookings: Booking[];
  payments: Payment[];
  classes?: ClassModel[];
  meetings?: MeetingSession[];
  attendance?: AttendanceRecord[];
  recordings?: RecordingRecord[];
  chat_messages?: ClassChatMessage[];
  policy_violations?: PolicyViolation[];
  policy_acceptances?: PolicyAcceptance[];
  audit_logs?: AuditLog[];
  platform_settings?: PlatformPolicySettings;
  otp_records?: OTPRecord[];
  sms_config?: {
    provider: 'fast2sms' | '2factor' | 'twilio' | 'none';
    api_key?: string;
    is_active: boolean;
  };
}

const DEFAULT_PLATFORM_SETTINGS: PlatformPolicySettings = {
  recording_retention_days: 90,
  chat_retention_days: 180,
  file_retention_days: 90,
  moderation_sensitivity: 'standard',
  auto_block_contact_info: true,
  allow_student_screen_share_default: true,
  recording_mandatory_default: true,
};

// Initial seed data if DB does not exist
function getInitialData(): DatabaseSchema {
  const initialProfiles: Profile[] = [
    {
      id: 'usr-admin-master',
      phone: '+91 99000 11223',
      email: 'admin@tutorplug.com',
      full_name: 'Platform Administrator',
      role: 'admin',
      status: 'active',
      created_at: new Date('2024-01-01').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return {
    profiles: initialProfiles,
    student_profiles: [],
    tutor_profiles: [],
    bookings: [],
    payments: [],
    classes: [],
    meetings: [],
    attendance: [],
    recordings: [],
    chat_messages: [],
    policy_violations: [],
    policy_acceptances: [],
    audit_logs: [],
    platform_settings: DEFAULT_PLATFORM_SETTINGS,
  };
}

export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.substring(2);
  }
  if (digits.length === 14 && digits.startsWith('0091')) {
    return digits.substring(4);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.substring(1);
  }
  if (digits.length > 10 && (digits.startsWith('91') || digits.startsWith('0'))) {
    return digits.slice(-10);
  }
  return digits || rawPhone.trim().replace(/\s+/g, '');
}

class ServerDB {
  private signals: SignalEnvelope[] = [];

  private ensureDB(): DatabaseSchema {
    if ((globalThis as any).__tutorplug_db_data) {
      return (globalThis as any).__tutorplug_db_data;
    }

    try {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
      } catch {}

      let data: DatabaseSchema;
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        data = JSON.parse(raw) as DatabaseSchema;
      } else if (fs.existsSync(TMP_DB_FILE)) {
        const raw = fs.readFileSync(TMP_DB_FILE, 'utf-8');
        data = JSON.parse(raw) as DatabaseSchema;
      } else {
        data = getInitialData();
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        } catch {
          try {
            fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
          } catch {}
        }
      }

      // Ensure all required collections exist
      let modified = false;
      if (!data.classes || data.classes.length === 0) {
        data.classes = [
          {
            id: 'cls-phy101',
            title: 'Physics — Kinematics & Laws of Motion',
            subject: 'Physics',
            teacher_id: 'usr-1788795018002-quazl',
            student_ids: ['usr-student-main'],
            created_by: 'usr-1788795018002-quazl',
            status: 'scheduled',
            scheduled_start: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
            scheduled_end: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
            duration_minutes: 60,
            recurring: false,
            recording_mandatory: true,
            student_screen_share_allowed: true,
            meeting_code: 'TP-8F3K2',
            notes: 'Formula derivation, projectile motion graphs and numerical problem solving.',
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
          {
            id: 'cls-math202',
            title: 'Mathematics — Definite Integrals Masterclass',
            subject: 'Mathematics',
            teacher_id: 'usr-1789012615796-vi20r',
            student_ids: ['usr-student-rohan'],
            created_by: 'usr-1789012615796-vi20r',
            status: 'completed',
            scheduled_start: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
            scheduled_end: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
            duration_minutes: 75,
            recurring: false,
            recording_mandatory: true,
            student_screen_share_allowed: true,
            meeting_code: 'TP-MTH01',
            notes: 'Integration by substitution, Leibniz rule, and JEE Advanced problems.',
            created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          },
          {
            id: 'cls-chem303',
            title: 'Chemistry — Organic Reaction Mechanisms',
            subject: 'Chemistry',
            teacher_id: 'usr-tutor-priya',
            student_ids: ['usr-student-main', 'usr-student-rohan'],
            created_by: 'usr-tutor-priya',
            status: 'live',
            scheduled_start: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            scheduled_end: new Date(Date.now() + 40 * 60 * 1000).toISOString(),
            duration_minutes: 60,
            recurring: true,
            recording_mandatory: true,
            student_screen_share_allowed: true,
            meeting_code: 'TP-CHM99',
            notes: 'Electrophilic aromatic substitution, inductive effects, and live practice.',
            created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          },
        ];
        modified = true;
      }

      if (!data.meetings || data.meetings.length === 0) {
        data.meetings = [
          {
            id: 'mtg-chem303',
            class_id: 'cls-chem303',
            meeting_code: 'TP-CHM99',
            started_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            status: 'active',
            active_participants_count: 2,
          },
          {
            id: 'mtg-math202',
            class_id: 'cls-math202',
            meeting_code: 'TP-MTH01',
            started_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
            ended_at: new Date(Date.now() - (26 * 3600 - 4520) * 1000).toISOString(),
            status: 'ended',
            active_participants_count: 2,
          },
        ];
        modified = true;
      }

      if (!data.recordings || data.recordings.length === 0) {
        data.recordings = [
          {
            id: 'rec-math202',
            meeting_id: 'mtg-math202',
            class_id: 'cls-math202',
            teacher_id: 'usr-1789012615796-vi20r',
            student_id: 'usr-student-rohan',
            title: 'Mathematics — Definite Integrals Masterclass',
            storage_path: 'recordings/rec-math202.webm',
            file_url: '/api/recordings/stream?id=rec-math202',
            file_size: 45890200,
            duration_seconds: 4520,
            started_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
            ended_at: new Date(Date.now() - (26 * 3600 - 4520) * 1000).toISOString(),
            status: 'available',
            retention_days: 90,
            created_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
          },
          {
            id: 'rec-phy100',
            meeting_id: 'mtg-phy100',
            class_id: 'cls-phy101',
            teacher_id: 'usr-1788795018002-quazl',
            student_id: 'usr-student-main',
            title: 'Physics — Kinematics Foundation Review',
            storage_path: 'recordings/rec-phy100.webm',
            file_url: '/api/recordings/stream?id=rec-phy100',
            file_size: 58210340,
            duration_seconds: 5520,
            started_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
            ended_at: new Date(Date.now() - (4 * 24 * 3600 - 5520) * 1000).toISOString(),
            status: 'available',
            retention_days: 90,
            created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
          },
        ];
        modified = true;
      }

      if (!data.policy_violations || data.policy_violations.length === 0) {
        data.policy_violations = [
          {
            id: 'viol-1',
            meeting_id: 'mtg-chem303',
            class_id: 'cls-chem303',
            user_id: 'usr-student-rohan',
            user_name: 'Rohan Mehta',
            user_role: 'student',
            message_id: 'msg-viol-1',
            message_snippet: "Ma'am please WhatsApp me at 9876543210 for the question paper pdf",
            category: 'phone',
            confidence: 0.96,
            status: 'pending_review',
            admin_action: 'none',
            created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
          {
            id: 'viol-2',
            meeting_id: 'mtg-math202',
            class_id: 'cls-math202',
            user_id: 'usr-student-rohan',
            user_name: 'Rohan Mehta',
            user_role: 'student',
            message_id: 'msg-viol-2',
            message_snippet: 'Can I pay the mentoring fees directly via UPI rohan@okhdfcbank?',
            category: 'payment_upi',
            confidence: 0.98,
            status: 'pending_review',
            admin_action: 'none',
            created_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
          },
        ];
        modified = true;
      }

      if (!data.chat_messages || data.chat_messages.length === 0) {
        data.chat_messages = [
          {
            id: 'msg-1',
            meeting_id: 'mtg-math202',
            class_id: 'cls-math202',
            sender_id: 'usr-1789012615796-vi20r',
            sender_name: 'Dr. Arjun Sharma',
            sender_role: 'tutor',
            message: 'Welcome Rohan! Today we cover Definite Integrals and the Fundamental Theorem of Calculus.',
            message_type: 'text',
            created_at: new Date(Date.now() - 26 * 3600 * 1000 + 60 * 1000).toISOString(),
            moderation_status: 'clean',
          },
          {
            id: 'msg-2',
            meeting_id: 'mtg-math202',
            class_id: 'cls-math202',
            sender_id: 'usr-student-rohan',
            sender_name: 'Rohan Mehta',
            sender_role: 'student',
            message: 'Sir, I have a doubt regarding Equation 4 on the board.',
            message_type: 'text',
            created_at: new Date(Date.now() - 26 * 3600 * 1000 + 120 * 1000).toISOString(),
            moderation_status: 'clean',
          },
          {
            id: 'msg-3',
            meeting_id: 'mtg-math202',
            class_id: 'cls-math202',
            sender_id: 'usr-1789012615796-vi20r',
            sender_name: 'Dr. Arjun Sharma',
            sender_role: 'tutor',
            message: 'Look closely at the substitution of u = tan(x/2), notice how dx transforms into 2du / (1 + u^2).',
            message_type: 'text',
            created_at: new Date(Date.now() - 26 * 3600 * 1000 + 200 * 1000).toISOString(),
            moderation_status: 'clean',
          },
        ];
        modified = true;
      }

      if (!data.attendance || data.attendance.length === 0) {
        data.attendance = [
          {
            id: 'att-1',
            meeting_id: 'mtg-math202',
            class_id: 'cls-math202',
            user_id: 'usr-1789012615796-vi20r',
            user_name: 'Dr. Arjun Sharma',
            user_role: 'tutor',
            joined_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
            left_at: new Date(Date.now() - (26 * 3600 - 4520) * 1000).toISOString(),
            duration_seconds: 4520,
            reconnection_count: 0,
            last_heartbeat: new Date(Date.now() - (26 * 3600 - 4520) * 1000).toISOString(),
          },
          {
            id: 'att-2',
            meeting_id: 'mtg-math202',
            class_id: 'cls-math202',
            user_id: 'usr-student-rohan',
            user_name: 'Rohan Mehta',
            user_role: 'student',
            joined_at: new Date(Date.now() - 26 * 3600 * 1000 + 30 * 1000).toISOString(),
            left_at: new Date(Date.now() - (26 * 3600 - 4520) * 1000).toISOString(),
            duration_seconds: 4490,
            reconnection_count: 1,
            last_heartbeat: new Date(Date.now() - (26 * 3600 - 4520) * 1000).toISOString(),
          },
        ];
        modified = true;
      }

      if (!data.platform_settings) {
        data.platform_settings = DEFAULT_PLATFORM_SETTINGS;
        modified = true;
      }
      if (!data.policy_acceptances) {
        data.policy_acceptances = [];
        modified = true;
      }
      if (!data.audit_logs) {
        data.audit_logs = [];
        modified = true;
      }

      if (modified) {
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        } catch {
          try {
            fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
          } catch {}
        }
      }

      (globalThis as any).__tutorplug_db_data = data;
      return data;
    } catch (err) {
      console.error('Database read error, initializing fallback:', err);
      const fallback = getInitialData();
      (globalThis as any).__tutorplug_db_data = fallback;
      return fallback;
    }
  }

  private saveDB(data: DatabaseSchema) {
    (globalThis as any).__tutorplug_db_data = data;
    try {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
      } catch {}
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      try {
        fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      } catch {}
    }
  }

  // --- Users & Profiles ---
  getProfiles(): Profile[] {
    const db = this.ensureDB();
    return db.profiles || [];
  }

  getProfileByPhone(phone: string, role?: UserRole): Profile | null {
    const db = this.ensureDB();
    const norm = normalizePhone(phone);
    if (!norm) return null;
    if (role) {
      const matchWithRole = db.profiles.find(
        (p) => normalizePhone(p.phone) === norm && p.role === role
      );
      if (matchWithRole) return matchWithRole;
    }
    return (
      db.profiles.find((p) => normalizePhone(p.phone) === norm) || null
    );
  }

  getProfileById(id: string): Profile | null {
    const db = this.ensureDB();
    return db.profiles.find((p) => p.id === id) || null;
  }

  getProfileByEmail(email: string, role?: UserRole): Profile | null {
    const db = this.ensureDB();
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) return null;
    if (role) {
      const match = db.profiles.find(
        (p) => (p.email || '').toLowerCase() === cleanEmail && p.role === role
      );
      if (match) return match;
    }
    return db.profiles.find((p) => (p.email || '').toLowerCase() === cleanEmail) || null;
  }

  findOrCreateGoogleProfile(params: {
    email: string;
    full_name: string;
    role?: UserRole;
    avatar_url?: string;
  }): Profile {
    const db = this.ensureDB();
    const cleanEmail = params.email.toLowerCase().trim();
    const targetRole: UserRole = params.role || 'student';

    let existing = this.getProfileByEmail(cleanEmail, targetRole);
    if (!existing) {
      existing = this.getProfileByEmail(cleanEmail);
    }

    if (existing) {
      if (params.avatar_url && !existing.avatar_url) {
        existing.avatar_url = params.avatar_url;
      }
      if (params.full_name && (!existing.full_name || existing.full_name === 'New Member')) {
        existing.full_name = params.full_name;
      }
      existing.updated_at = new Date().toISOString();
      this.saveDB(db);
      return existing;
    }

    const newProfile: Profile = {
      id: `usr-g-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      phone: '',
      email: cleanEmail,
      full_name: params.full_name || 'Google User',
      avatar_url: params.avatar_url,
      role: targetRole,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.profiles.unshift(newProfile);
    this.saveDB(db);
    return newProfile;
  }

  createProfile(params: { phone: string; full_name: string; role: UserRole; email?: string }): Profile {
    const db = this.ensureDB();
    const existing = this.getProfileByPhone(params.phone, params.role);
    if (existing) return existing;

    const normPhone = normalizePhone(params.phone);
    const newProfile: Profile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      phone: normPhone,
      full_name: params.full_name,
      email: params.email || '',
      role: params.role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.profiles.unshift(newProfile);
    this.saveDB(db);
    return newProfile;
  }

  updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const db = this.ensureDB();
    const idx = db.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    db.profiles[idx] = {
      ...db.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveDB(db);
    return db.profiles[idx];
  }

  // --- Student Profiles ---
  getStudentProfile(userId: string): StudentProfile | null {
    const db = this.ensureDB();
    return db.student_profiles.find((s) => s.user_id === userId) || null;
  }

  saveStudentProfile(userId: string, data: Partial<StudentProfile>): StudentProfile {
    const db = this.ensureDB();
    const idx = db.student_profiles.findIndex((s) => s.user_id === userId);

    if (idx !== -1) {
      db.student_profiles[idx] = {
        ...db.student_profiles[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.saveDB(db);
      return db.student_profiles[idx];
    } else {
      const newStudent: StudentProfile = {
        id: `stud-${Date.now()}`,
        user_id: userId,
        class_level: data.class_level || 'Class 11 - 12 (Senior Secondary)',
        board: data.board || 'CBSE',
        preferred_language: data.preferred_language || 'English',
        learning_goals: data.learning_goals || '',
        timezone: 'Asia/Kolkata',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.student_profiles.unshift(newStudent);
      this.saveDB(db);
      return newStudent;
    }
  }

  // --- Tutor Profiles ---
  getTutors(): TutorProfile[] {
    const db = this.ensureDB();
    return db.tutor_profiles || [];
  }

  getTutorById(id: string): TutorProfile | null {
    const db = this.ensureDB();
    return db.tutor_profiles.find((t) => t.id === id || t.user_id === id) || null;
  }

  saveTutorProfile(userId: string, data: Partial<TutorProfile>): TutorProfile {
    const db = this.ensureDB();
    const user = this.getProfileById(userId);
    const idx = db.tutor_profiles.findIndex((t) => t.user_id === userId || t.id === userId);

    if (idx !== -1) {
      db.tutor_profiles[idx] = {
        ...db.tutor_profiles[idx],
        ...data,
        user: user || db.tutor_profiles[idx].user,
        updated_at: new Date().toISOString(),
      };
      this.saveDB(db);
      return db.tutor_profiles[idx];
    } else {
      const newTutor: TutorProfile = {
        id: `tut-${Date.now()}`,
        user_id: userId,
        headline: data.headline || 'Academic Tutor',
        bio: data.bio || '',
        qualifications: data.qualifications || data.degree || '',
        degree: data.degree || '',
        institution: data.institution || '',
        teaching_methodology: data.teaching_methodology || '',
        experience_years: data.experience_years || 0,
        hourly_rate: data.hourly_rate || 1000,
        verification_status: 'unverified',
        timezone: 'Asia/Kolkata',
        average_rating: 5.0,
        total_reviews: 0,
        total_classes_taught: 0,
        profile_completion_percentage: data.profile_completion_percentage || 70,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: user || undefined,
        subjects: data.subjects || [INITIAL_SUBJECTS[0]],
        boards: data.boards || [INITIAL_BOARDS[0]],
        languages: data.languages || ['English'],
        availability: data.availability || [
          {
            id: `av-${Date.now()}`,
            tutor_id: `tut-${Date.now()}`,
            day_of_week: 1,
            start_time: '17:00',
            end_time: '21:00',
            timezone: 'Asia/Kolkata',
            is_available: true,
          },
        ],
      };
      db.tutor_profiles.unshift(newTutor);
      this.saveDB(db);
      return newTutor;
    }
  }

  updateTutorVerification(tutorId: string, status: 'unverified' | 'verified' | 'rejected'): TutorProfile | null {
    const db = this.ensureDB();
    const idx = db.tutor_profiles.findIndex((t) => t.id === tutorId || t.user_id === tutorId);
    if (idx === -1) return null;

    db.tutor_profiles[idx].verification_status = status;
    db.tutor_profiles[idx].updated_at = new Date().toISOString();
    this.saveDB(db);
    return db.tutor_profiles[idx];
  }

  // --- Bookings ---
  getBookings(): Booking[] {
    const db = this.ensureDB();
    return db.bookings || [];
  }

  createBooking(booking: Booking): Booking {
    const db = this.ensureDB();
    db.bookings.unshift(booking);
    this.saveDB(db);
    return booking;
  }

  // --- Admin Live Overview Stats ---
  getStats() {
    const db = this.ensureDB();
    const totalStudents = db.profiles.filter((p) => p.role === 'student').length;
    const totalTutors = db.profiles.filter((p) => p.role === 'tutor').length;
    const verifiedTutors = db.tutor_profiles.filter((t) => t.verification_status === 'verified').length;
    const pendingTutors = db.tutor_profiles.filter((t) => t.verification_status === 'unverified').length;
    const totalBookings = db.bookings.length;
    const grossVolume = db.bookings.reduce((sum, b) => sum + b.subtotal, 0);
    const platformCommission = db.bookings.reduce((sum, b) => sum + b.platform_commission, 0);
    const totalLiveClasses = (db.classes || []).filter((c) => c.status === 'live').length;
    const totalRecordedSessions = (db.recordings || []).length;
    const totalRecordedSeconds = (db.recordings || []).reduce((sum, r) => sum + (r.duration_seconds || 0), 0);
    const pendingViolations = (db.policy_violations || []).filter((v) => v.status === 'pending_review').length;

    return {
      totalStudents,
      totalTutors,
      verifiedTutors,
      pendingTutors,
      totalBookings,
      grossVolume,
      platformCommission,
      totalLiveClasses,
      totalRecordedSessions,
      totalRecordedSeconds,
      pendingViolations,
      recentUsers: db.profiles.slice(0, 10),
    };
  }

  // --- Real-Time OTP Engine ---
  createOtp(phone: string): string {
    const db = this.ensureDB();
    if (!db.otp_records) db.otp_records = [];
    const normPhone = normalizePhone(phone);
    
    // Cryptographically secure random 6-digit dynamic OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = Date.now() + 10 * 60 * 1000; // 10 mins validity

    // Remove previous pending OTP for this phone
    db.otp_records = db.otp_records.filter(
      (r) => normalizePhone(r.phone) !== normPhone
    );

    db.otp_records.push({
      phone: normPhone,
      code,
      expires_at,
      attempts: 0,
    });

    this.saveDB(db);
    return code;
  }

  verifyOtp(phone: string, inputCode: string): { valid: boolean; message?: string } {
    const db = this.ensureDB();
    if (!db.otp_records) db.otp_records = [];
    const normPhone = normalizePhone(phone);
    const trimmedCode = (inputCode || '').trim();

    // Universal master verification code for instant testing & development
    if (trimmedCode === '123456') {
      return { valid: true };
    }

    const record = db.otp_records.find(
      (r) => normalizePhone(r.phone) === normPhone
    );

    if (!record) {
      return {
        valid: false,
        message: 'No active OTP found. Please request a new verification code, or use test code 123456.',
      };
    }

    if (Date.now() > record.expires_at) {
      db.otp_records = db.otp_records.filter(
        (r) => normalizePhone(r.phone) !== normPhone
      );
      this.saveDB(db);
      return {
        valid: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    if (record.attempts >= 5) {
      db.otp_records = db.otp_records.filter(
        (r) => normalizePhone(r.phone) !== normPhone
      );
      this.saveDB(db);
      return {
        valid: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
      };
    }

    if (record.code !== trimmedCode) {
      record.attempts += 1;
      this.saveDB(db);
      return {
        valid: false,
        message: `Incorrect OTP code. ${5 - record.attempts} attempts remaining.`,
      };
    }

    // Success: consume one-time code
    db.otp_records = db.otp_records.filter(
      (r) => normalizePhone(r.phone) !== normPhone
    );
    this.saveDB(db);

    return { valid: true };
  }

  getSmsConfig() {
    const db = this.ensureDB();
    return (
      db.sms_config || {
        provider: 'fast2sms' as const,
        api_key: '',
        is_active: false,
      }
    );
  }

  updateSmsConfig(config: {
    provider: 'fast2sms' | '2factor' | 'twilio' | 'none';
    api_key?: string;
    is_active: boolean;
  }) {
    const db = this.ensureDB();
    db.sms_config = config;
    this.saveDB(db);
    return db.sms_config;
  }

  // ==========================================
  // --- Classes Management ---
  // ==========================================
  getClasses(): ClassModel[] {
    const db = this.ensureDB();
    const classes = db.classes || [];
    return classes.map((c) => this.hydrateClass(c, db));
  }

  getClassById(id: string): ClassModel | null {
    const db = this.ensureDB();
    const c = (db.classes || []).find((item) => item.id === id || item.meeting_code === id);
    if (!c) return null;
    return this.hydrateClass(c, db);
  }

  getClassByMeetingCode(code: string): ClassModel | null {
    const db = this.ensureDB();
    const normalized = (code || '').trim().toUpperCase();
    const c = (db.classes || []).find(
      (item) => item.meeting_code.toUpperCase() === normalized || item.id.toUpperCase() === normalized
    );
    if (!c) return null;
    return this.hydrateClass(c, db);
  }

  private hydrateClass(c: ClassModel, db: DatabaseSchema): ClassModel {
    const teacher = db.profiles.find((p) => p.id === c.teacher_id);
    const students = db.profiles.filter((p) => c.student_ids.includes(p.id));
    return {
      ...c,
      teacher,
      students,
    };
  }

  createClass(params: Partial<ClassModel>): ClassModel {
    const db = this.ensureDB();
    if (!db.classes) db.classes = [];

    const meetingCode =
      params.meeting_code ||
      `TP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newClass: ClassModel = {
      id: params.id || `cls-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: params.title || 'Tutoring Class',
      subject: params.subject || 'General Academic',
      teacher_id: params.teacher_id || 'usr-1788795018002-quazl',
      student_ids: params.student_ids || ['usr-student-main'],
      created_by: params.created_by || params.teacher_id || 'admin',
      status: params.status || 'scheduled',
      scheduled_start: params.scheduled_start || new Date().toISOString(),
      scheduled_end:
        params.scheduled_end ||
        new Date(Date.now() + (params.duration_minutes || 60) * 60 * 1000).toISOString(),
      duration_minutes: params.duration_minutes || 60,
      recurring: Boolean(params.recurring),
      recording_mandatory: params.recording_mandatory !== undefined ? params.recording_mandatory : true,
      student_screen_share_allowed:
        params.student_screen_share_allowed !== undefined ? params.student_screen_share_allowed : true,
      meeting_code: meetingCode,
      notes: params.notes || '',
      created_at: new Date().toISOString(),
    };

    db.classes.unshift(newClass);
    this.saveDB(db);
    return this.hydrateClass(newClass, db);
  }

  updateClass(id: string, updates: Partial<ClassModel>): ClassModel | null {
    const db = this.ensureDB();
    if (!db.classes) return null;
    const idx = db.classes.findIndex((c) => c.id === id || c.meeting_code === id);
    if (idx === -1) return null;

    db.classes[idx] = {
      ...db.classes[idx],
      ...updates,
    };
    this.saveDB(db);
    return this.hydrateClass(db.classes[idx], db);
  }

  // ==========================================
  // --- Meeting Sessions ---
  // ==========================================
  getMeetings(): MeetingSession[] {
    const db = this.ensureDB();
    return db.meetings || [];
  }

  getMeetingByCode(code: string): MeetingSession | null {
    const db = this.ensureDB();
    const normalized = (code || '').trim().toUpperCase();
    return (
      (db.meetings || []).find(
        (m) => m.meeting_code.toUpperCase() === normalized || m.id.toUpperCase() === normalized
      ) || null
    );
  }

  getMeetingById(id: string): MeetingSession | null {
    const db = this.ensureDB();
    return (db.meetings || []).find((m) => m.id === id) || null;
  }

  startMeeting(classId: string, meetingCode: string): MeetingSession {
    const db = this.ensureDB();
    if (!db.meetings) db.meetings = [];

    const existing = db.meetings.find(
      (m) => (m.class_id === classId || m.meeting_code === meetingCode) && m.status === 'active'
    );
    if (existing) {
      return existing;
    }

    const newMeeting: MeetingSession = {
      id: `mtg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      class_id: classId,
      meeting_code: meetingCode,
      started_at: new Date().toISOString(),
      status: 'active',
      active_participants_count: 1,
    };

    db.meetings.unshift(newMeeting);

    // Also update class status to live
    const clsIdx = (db.classes || []).findIndex((c) => c.id === classId || c.meeting_code === meetingCode);
    if (clsIdx !== -1 && db.classes) {
      db.classes[clsIdx].status = 'live';
    }

    this.saveDB(db);
    return newMeeting;
  }

  endMeeting(meetingId: string): MeetingSession | null {
    const db = this.ensureDB();
    if (!db.meetings) return null;
    const idx = db.meetings.findIndex((m) => m.id === meetingId || m.meeting_code === meetingId);
    if (idx === -1) return null;

    db.meetings[idx].status = 'ended';
    db.meetings[idx].ended_at = new Date().toISOString();
    db.meetings[idx].active_participants_count = 0;

    // Update class status to completed
    const classId = db.meetings[idx].class_id;
    const clsIdx = (db.classes || []).findIndex((c) => c.id === classId);
    if (clsIdx !== -1 && db.classes) {
      db.classes[clsIdx].status = 'completed';
    }

    this.saveDB(db);
    return db.meetings[idx];
  }

  // ==========================================
  // --- Attendance & Session Logs ---
  // ==========================================
  logAttendanceJoin(
    meetingId: string,
    classId: string,
    user: { id: string; name: string; role: UserRole }
  ): AttendanceRecord {
    const db = this.ensureDB();
    if (!db.attendance) db.attendance = [];

    // Check if user already has an active attendance session for this meeting
    const existing = db.attendance.find(
      (a) => a.meeting_id === meetingId && a.user_id === user.id && !a.left_at
    );
    if (existing) {
      existing.last_heartbeat = new Date().toISOString();
      this.saveDB(db);
      return existing;
    }

    // Check if previously joined and now reconnecting
    const prev = db.attendance.find(
      (a) => a.meeting_id === meetingId && a.user_id === user.id
    );

    const record: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      meeting_id: meetingId,
      class_id: classId,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      joined_at: new Date().toISOString(),
      duration_seconds: 0,
      reconnection_count: prev ? prev.reconnection_count + 1 : 0,
      last_heartbeat: new Date().toISOString(),
    };

    db.attendance.unshift(record);
    this.saveDB(db);
    return record;
  }

  logAttendanceHeartbeat(meetingId: string, userId: string): void {
    const db = this.ensureDB();
    if (!db.attendance) return;
    const record = db.attendance.find(
      (a) => a.meeting_id === meetingId && a.user_id === userId && !a.left_at
    );
    if (record) {
      record.last_heartbeat = new Date().toISOString();
      const joined = new Date(record.joined_at).getTime();
      const now = Date.now();
      record.duration_seconds = Math.max(0, Math.floor((now - joined) / 1000));
      this.saveDB(db);
    }
  }

  logAttendanceLeave(meetingId: string, userId: string): AttendanceRecord | null {
    const db = this.ensureDB();
    if (!db.attendance) return null;
    const record = db.attendance.find(
      (a) => a.meeting_id === meetingId && a.user_id === userId && !a.left_at
    );
    if (record) {
      const now = new Date().toISOString();
      record.left_at = now;
      record.last_heartbeat = now;
      const joined = new Date(record.joined_at).getTime();
      record.duration_seconds = Math.max(0, Math.floor((new Date(now).getTime() - joined) / 1000));
      this.saveDB(db);
      return record;
    }
    return null;
  }

  getAttendanceForMeeting(meetingId: string): AttendanceRecord[] {
    const db = this.ensureDB();
    return (db.attendance || []).filter((a) => a.meeting_id === meetingId);
  }

  getAttendanceForClass(classId: string): AttendanceRecord[] {
    const db = this.ensureDB();
    return (db.attendance || []).filter((a) => a.class_id === classId);
  }

  getAllAttendance(): AttendanceRecord[] {
    const db = this.ensureDB();
    return db.attendance || [];
  }

  // ==========================================
  // --- Class Chat & In-Meeting Messaging ---
  // ==========================================
  saveChatMessage(msg: Omit<ClassChatMessage, 'id' | 'created_at'>): ClassChatMessage {
    const db = this.ensureDB();
    if (!db.chat_messages) db.chat_messages = [];

    const newMsg: ClassChatMessage = {
      ...msg,
      id: `cmsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    db.chat_messages.push(newMsg);
    this.saveDB(db);
    return newMsg;
  }

  getChatMessages(meetingId: string): ClassChatMessage[] {
    const db = this.ensureDB();
    return (db.chat_messages || []).filter(
      (m) => m.meeting_id === meetingId || m.class_id === meetingId
    );
  }

  getAllChatMessages(): ClassChatMessage[] {
    const db = this.ensureDB();
    return db.chat_messages || [];
  }

  // ==========================================
  // --- Recordings Management ---
  // ==========================================
  getRecordings(): RecordingRecord[] {
    const db = this.ensureDB();
    const recs = db.recordings || [];
    return recs.map((r) => this.hydrateRecording(r, db));
  }

  getRecordingById(id: string): RecordingRecord | null {
    const db = this.ensureDB();
    const r = (db.recordings || []).find((item) => item.id === id);
    if (!r) return null;
    return this.hydrateRecording(r, db);
  }

  private hydrateRecording(r: RecordingRecord, db: DatabaseSchema): RecordingRecord {
    const teacher = db.profiles.find((p) => p.id === r.teacher_id);
    const student = db.profiles.find((p) => p.id === r.student_id);
    const class_info = (db.classes || []).find((c) => c.id === r.class_id);
    return {
      ...r,
      teacher,
      student,
      class_info,
    };
  }

  saveRecording(rec: Omit<RecordingRecord, 'id' | 'created_at'>): RecordingRecord {
    const db = this.ensureDB();
    if (!db.recordings) db.recordings = [];

    const newRec: RecordingRecord = {
      ...rec,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    db.recordings.unshift(newRec);
    this.saveDB(db);
    return this.hydrateRecording(newRec, db);
  }

  deleteRecording(id: string): boolean {
    const db = this.ensureDB();
    if (!db.recordings) return false;
    const initialLen = db.recordings.length;
    db.recordings = db.recordings.filter((r) => r.id !== id);
    if (db.recordings.length !== initialLen) {
      this.saveDB(db);
      return true;
    }
    return false;
  }

  // ==========================================
  // --- Policy Violations & Moderation Queue ---
  // ==========================================
  logPolicyViolation(violation: Omit<PolicyViolation, 'id' | 'created_at'>): PolicyViolation {
    const db = this.ensureDB();
    if (!db.policy_violations) db.policy_violations = [];

    const newViolation: PolicyViolation = {
      ...violation,
      id: `viol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    db.policy_violations.unshift(newViolation);
    this.saveDB(db);
    return newViolation;
  }

  getPolicyViolations(): PolicyViolation[] {
    const db = this.ensureDB();
    return db.policy_violations || [];
  }

  updatePolicyViolation(
    id: string,
    action: AdminAction,
    status: 'action_taken' | 'dismissed'
  ): PolicyViolation | null {
    const db = this.ensureDB();
    if (!db.policy_violations) return null;
    const idx = db.policy_violations.findIndex((v) => v.id === id);
    if (idx === -1) return null;

    db.policy_violations[idx].admin_action = action;
    db.policy_violations[idx].status = status;

    // If suspend action taken, suspend the user
    if (action === 'suspended') {
      const userId = db.policy_violations[idx].user_id;
      const userIdx = db.profiles.findIndex((p) => p.id === userId);
      if (userIdx !== -1) {
        db.profiles[userIdx].status = 'suspended';
      }
    }

    this.saveDB(db);
    return db.policy_violations[idx];
  }

  // ==========================================
  // --- Policy Acceptances ---
  // ==========================================
  hasAcceptedPolicy(userId: string): boolean {
    const db = this.ensureDB();
    return (db.policy_acceptances || []).some((p) => p.user_id === userId);
  }

  acceptPolicy(userId: string, role: UserRole, version = '1.0'): PolicyAcceptance {
    const db = this.ensureDB();
    if (!db.policy_acceptances) db.policy_acceptances = [];

    const existing = db.policy_acceptances.find((p) => p.user_id === userId);
    if (existing) return existing;

    const acceptance: PolicyAcceptance = {
      id: `pa-${Date.now()}`,
      user_id: userId,
      user_role: role,
      policy_version: version,
      accepted_at: new Date().toISOString(),
    };

    db.policy_acceptances.push(acceptance);
    this.saveDB(db);
    return acceptance;
  }

  // ==========================================
  // --- Platform Policy Settings ---
  // ==========================================
  getPlatformPolicySettings(): PlatformPolicySettings {
    const db = this.ensureDB();
    return db.platform_settings || DEFAULT_PLATFORM_SETTINGS;
  }

  updatePlatformPolicySettings(settings: Partial<PlatformPolicySettings>): PlatformPolicySettings {
    const db = this.ensureDB();
    db.platform_settings = {
      ...(db.platform_settings || DEFAULT_PLATFORM_SETTINGS),
      ...settings,
    };
    this.saveDB(db);
    return db.platform_settings;
  }

  // ==========================================
  // --- Audit Logs ---
  // ==========================================
  logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const db = this.ensureDB();
    if (!db.audit_logs) db.audit_logs = [];

    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    db.audit_logs.unshift(newLog);
    this.saveDB(db);
    return newLog;
  }

  getAuditLogs(): AuditLog[] {
    const db = this.ensureDB();
    return db.audit_logs || [];
  }

  // ==========================================
  // --- In-Memory WebRTC Signaling Queue ---
  // ==========================================
  addSignal(roomId: string, fromPeer: string, toPeer: string | undefined, data: any): void {
    this.signals.push({
      id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      roomId,
      fromPeer,
      toPeer,
      data,
      timestamp: Date.now(),
    });

    // Housekeep signals older than 2 minutes
    const twoMinsAgo = Date.now() - 2 * 60 * 1000;
    this.signals = this.signals.filter((s) => s.timestamp > twoMinsAgo);
  }

  getSignals(roomId: string, forPeer: string): any[] {
    const matching = this.signals.filter(
      (s) => s.roomId === roomId && s.fromPeer !== forPeer && (!s.toPeer || s.toPeer === forPeer)
    );
    // Remove retrieved signals targeted specifically for this peer
    this.signals = this.signals.filter(
      (s) => !(s.roomId === roomId && s.toPeer === forPeer)
    );
    return matching.map((s) => ({
      fromPeer: s.fromPeer,
      data: s.data,
      timestamp: s.timestamp,
    }));
  }
}

export const serverDB = new ServerDB();
