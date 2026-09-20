// TUTOR PLUG — Universal Domain & Schema Types
// Matching PostgreSQL / Supabase Schema

export type UserRole = 'student' | 'tutor' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type VerificationStatus = 'unverified' | 'verified' | 'rejected';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
export type ClassSessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  phone: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  class_level?: string;
  board?: string;
  preferred_language: string;
  learning_goals?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface TutorProfile {
  id: string;
  user_id: string;
  headline?: string;
  bio?: string;
  qualifications?: string;
  degree?: string;
  institution?: string;
  teaching_methodology?: string;
  experience_years: number;
  hourly_rate: number;
  verification_status: VerificationStatus;
  timezone: string;
  average_rating: number;
  total_reviews: number;
  total_classes_taught: number;
  profile_completion_percentage: number;
  created_at: string;
  updated_at: string;
  // Joined fields for marketplace display
  user?: Profile;
  subjects?: Subject[];
  class_levels?: ClassLevel[];
  boards?: Board[];
  languages?: string[];
  availability?: TutorAvailability[];
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
}

export interface ClassLevel {
  id: string;
  name: string;
  order_index: number;
}

export interface Board {
  id: string;
  name: string;
  full_name?: string;
}

export interface TutorAvailability {
  id: string;
  tutor_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;  // "09:00"
  end_time: string;    // "18:00"
  timezone: string;
  is_available: boolean;
}

export interface Booking {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  class_level_id?: string;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  hourly_rate: number;
  subtotal: number;
  platform_commission: number;
  tutor_earning: number;
  currency: string;
  status: BookingStatus;
  meeting_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joins
  student?: Profile;
  tutor?: TutorProfile;
  subject?: Subject;
}

export interface Payment {
  id: string;
  booking_id: string;
  student_id: string;
  tutor_id: string;
  amount: number;
  platform_fee: number;
  tutor_amount: number;
  currency: string;
  payment_provider: string;
  transaction_id?: string;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
  // Joins
  booking?: Booking;
  tutor?: Profile;
  student?: Profile;
}

export interface Conversation {
  id: string;
  student_id: string;
  tutor_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  // Joins
  student?: Profile;
  tutor?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  attachment_url?: string;
  attachment_type?: string;
  read_at?: string;
  created_at: string;
  sender?: Profile;
}

export interface ClassSession {
  id: string;
  booking_id: string;
  tutor_id: string;
  student_id: string;
  meeting_provider: string;
  meeting_url?: string;
  started_at?: string;
  ended_at?: string;
  recording_url?: string;
  status: ClassSessionStatus;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  student_id: string;
  tutor_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  student?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking_confirmed' | 'class_reminder' | 'message_received' | 'payment_success' | 'verification_update';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

export interface PlatformSettings {
  commission_percentage: number;
  currency: string;
  min_fee: number;
  enable_instant_booking: boolean;
}

export interface TutorFilterParams {
  search?: string;
  subject?: string;
  class_level?: string;
  board?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  experience?: string;
  language?: string;
  sort_by?: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'experience';
}

// --- TUTOR PLUG VIDEO CLASSROOM & PLATFORM SPECIFICATION ---

export type MeetingStatus = 'scheduled' | 'live' | 'completed' | 'active' | 'ended' | 'cancelled';
export type RecordingStatus = 'recording' | 'available' | 'processing' | 'failed';
export type ModerationStatus = 'clean' | 'flagged' | 'blocked';
export type ViolationCategory = 'phone' | 'email' | 'social_handle' | 'payment_upi' | 'off_platform';
export type ViolationStatus = 'pending_review' | 'action_taken' | 'dismissed';
export type AdminAction = 'none' | 'warned' | 'messaging_restricted' | 'suspended';

export interface ClassModel {
  id: string;
  title: string;
  subject: string;
  teacher_id: string;
  student_ids: string[];
  created_by: string;
  status: MeetingStatus;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  recurring: boolean;
  recording_mandatory: boolean;
  student_screen_share_allowed: boolean;
  meeting_code: string;
  notes?: string;
  created_at: string;
  // Joins
  teacher?: Profile;
  students?: Profile[];
}

export interface MeetingSession {
  id: string;
  class_id: string;
  meeting_code: string;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'ended';
  active_participants_count: number;
}

export interface AttendanceRecord {
  id: string;
  meeting_id: string;
  class_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  joined_at: string;
  left_at?: string;
  duration_seconds: number;
  reconnection_count: number;
  last_heartbeat: string;
}

export interface RecordingRecord {
  id: string;
  meeting_id: string;
  class_id: string;
  teacher_id: string;
  student_id: string;
  title: string;
  storage_path: string;
  file_url?: string;
  file_size: number;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
  status: RecordingStatus;
  retention_days: number;
  created_at: string;
  // Joins
  teacher?: Profile;
  student?: Profile;
  class_info?: ClassModel;
}

export interface ClassChatMessage {
  id: string;
  meeting_id: string;
  class_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  message: string;
  message_type: 'text' | 'image' | 'file';
  attachment_url?: string;
  attachment_type?: string;
  attachment_size?: number;
  attachment_name?: string;
  created_at: string;
  moderation_status: ModerationStatus;
}

export interface PolicyViolation {
  id: string;
  meeting_id: string;
  class_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  message_id: string;
  message_snippet: string;
  category: ViolationCategory;
  confidence: number;
  status: ViolationStatus;
  admin_action: AdminAction;
  created_at: string;
}

export interface PolicyAcceptance {
  id: string;
  user_id: string;
  user_role: UserRole;
  policy_version: string;
  accepted_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  timestamp: string;
}

export interface PlatformPolicySettings {
  recording_retention_days: number;
  chat_retention_days: number;
  file_retention_days: number;
  moderation_sensitivity: 'strict' | 'standard' | 'lenient';
  auto_block_contact_info: boolean;
  allow_student_screen_share_default: boolean;
  recording_mandatory_default: boolean;
}
