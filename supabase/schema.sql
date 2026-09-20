-- ========================================================================
-- TUTOR PLUG — Production-Ready PostgreSQL / Supabase Database Architecture
-- Tagline: Learn Better. Teach Better.
-- ========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'tutor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE class_session_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------
-- 2. USERS & PROFILES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'student',
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ------------------------------------------------------------------------
-- 3. STUDENT PROFILES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    class_level TEXT,
    board TEXT,
    preferred_language TEXT DEFAULT 'English',
    learning_goals TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_profiles_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles(user_id);

-- ------------------------------------------------------------------------
-- 4. TUTOR PROFILES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tutor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    qualifications TEXT,
    degree TEXT,
    institution TEXT,
    teaching_methodology TEXT,
    experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 500.00 CHECK (hourly_rate >= 0),
    verification_status verification_status NOT NULL DEFAULT 'unverified',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    average_rating NUMERIC(3, 2) DEFAULT 5.00,
    total_reviews INTEGER DEFAULT 0,
    total_classes_taught INTEGER DEFAULT 0,
    profile_completion_percentage INTEGER DEFAULT 60 CHECK (profile_completion_percentage BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tutor_profiles_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_tutor_profiles_user ON tutor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_verification ON tutor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_rate ON tutor_profiles(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_rating ON tutor_profiles(average_rating);

-- ------------------------------------------------------------------------
-- 5. TAXONOMY: SUBJECTS, CLASS LEVELS, BOARDS & LANGUAGES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT DEFAULT 'BookOpen',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    order_index INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    full_name TEXT
);

-- Many-to-many relationship tables
CREATE TABLE IF NOT EXISTS tutor_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT uq_tutor_subject UNIQUE (tutor_id, subject_id)
);

CREATE TABLE IF NOT EXISTS tutor_class_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    class_level_id UUID NOT NULL REFERENCES class_levels(id) ON DELETE CASCADE,
    CONSTRAINT uq_tutor_class_level UNIQUE (tutor_id, class_level_id)
);

CREATE TABLE IF NOT EXISTS tutor_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT uq_tutor_board UNIQUE (tutor_id, board_id)
);

CREATE TABLE IF NOT EXISTS tutor_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    CONSTRAINT uq_tutor_language UNIQUE (tutor_id, language)
);

CREATE INDEX IF NOT EXISTS idx_tutor_subjects_subject ON tutor_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_tutor_class_levels_level ON tutor_class_levels(class_level_id);
CREATE INDEX IF NOT EXISTS idx_tutor_boards_board ON tutor_boards(board_id);

-- ------------------------------------------------------------------------
-- 6. AVAILABILITY SCHEDULE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tutor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_availability_time CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_tutor_availability_lookup ON tutor_availability(tutor_id, day_of_week);

-- ------------------------------------------------------------------------
-- 7. BOOKINGS ENGINE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    class_level_id UUID REFERENCES class_levels(id) ON DELETE SET NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    platform_commission NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (platform_commission >= 0),
    tutor_earning NUMERIC(10, 2) NOT NULL CHECK (tutor_earning >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status booking_status NOT NULL DEFAULT 'pending',
    meeting_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_booking_schedule CHECK (scheduled_end > scheduled_start)
);

CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor ON bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(scheduled_start);

-- ------------------------------------------------------------------------
-- 8. PAYMENTS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (platform_fee >= 0),
    tutor_amount NUMERIC(10, 2) NOT NULL CHECK (tutor_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_provider TEXT NOT NULL DEFAULT 'Razorpay', -- Razorpay, Stripe, UPI
    transaction_id TEXT UNIQUE,
    status payment_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_tutor ON payments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ------------------------------------------------------------------------
-- 9. CONVERSATIONS & CHAT MESSAGES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_conversation_pair UNIQUE (student_id, tutor_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_student ON conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tutor ON conversations(tutor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_url TEXT,
    attachment_type TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ------------------------------------------------------------------------
-- 10. CLASS SESSIONS (Live Video Room Foundation)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    meeting_provider TEXT NOT NULL DEFAULT 'TutorPlugLive', -- Daily.co, WebRTC, Agora, Google Meet
    meeting_url TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    recording_url TEXT,
    status class_session_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_sessions_booking ON class_sessions(booking_id);

-- ------------------------------------------------------------------------
-- 11. REVIEWS & RATINGS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_review_booking UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_tutor ON reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ------------------------------------------------------------------------
-- 12. NOTIFICATIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'booking_confirmed', 'class_reminder', 'message_received', 'payment_success'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);

-- ------------------------------------------------------------------------
-- 13. PLATFORM CONFIGURATION (No Hardcoded Commission)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platform_settings (key, value, description)
VALUES 
    ('commission_rate', '{"default_percentage": 25, "currency": "INR", "min_fee": 50}'::jsonb, 'Platform fee percentage applied to tutor bookings'),
    ('feature_flags', '{"enable_instant_booking": true, "enable_recordings": false, "enable_sms_otp": true}'::jsonb, 'Global feature flags')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------
-- 15. SEED DATA (Taxonomies, Sample Profiles, Tutors, Bookings)
-- ------------------------------------------------------------------------

-- Insert Subjects
INSERT INTO subjects (name, slug, description, icon_name) VALUES
    ('Mathematics', 'mathematics', 'Algebra, Calculus, Trigonometry, Geometry & JEE Prep', 'Calculator'),
    ('Physics', 'physics', 'Mechanics, Electromagnetism, Thermodynamics & Optics', 'Zap'),
    ('Chemistry', 'chemistry', 'Organic, Inorganic & Physical Chemistry', 'FlaskConical'),
    ('Computer Science', 'computer-science', 'Python, Java, Web Development, Data Structures', 'Code'),
    ('Biology', 'biology', 'Genetics, Physiology, Botany, Zoology & NEET Prep', 'Dna'),
    ('English Language & Lit', 'english', 'Grammar, Creative Writing, Literature & IELTS/TOEFL', 'BookOpen'),
    ('Economics', 'economics', 'Microeconomics, Macroeconomics, Statistics & Commerce', 'TrendingUp'),
    ('Accountancy', 'accountancy', 'Financial Accounting, Taxation & Business Studies', 'PieChart')
ON CONFLICT (slug) DO NOTHING;

-- Insert Class Levels
INSERT INTO class_levels (name, order_index) VALUES
    ('Primary (Classes 1 - 5)', 1),
    ('Middle School (Classes 6 - 8)', 2),
    ('Secondary (Classes 9 - 10)', 3),
    ('Senior Secondary (Classes 11 - 12)', 4),
    ('Competitive Exams (JEE / NEET / CUET)', 5),
    ('College / University', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert Boards
INSERT INTO boards (name, full_name) VALUES
    ('CBSE', 'Central Board of Secondary Education'),
    ('ICSE / ISC', 'Council for the Indian School Certificate Examinations'),
    ('IB', 'International Baccalaureate'),
    ('Cambridge (IGCSE/A-Levels)', 'Cambridge Assessment International Education'),
    ('State Board', 'State Educational Board')
ON CONFLICT (name) DO NOTHING;
