import { ViolationCategory } from '@/lib/types';

export interface ModerationResult {
  isViolation: boolean;
  category?: ViolationCategory;
  confidence: number;
  matchedSnippet?: string;
  reason?: string;
  action: 'block' | 'flag' | 'pass';
}

const NUMBER_WORDS: Record<string, string> = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  oh: '0',
};

/**
 * Normalizes text to uncover disguised phone numbers (e.g. "nine eight 7 6...")
 */
function extractPotentialDigits(text: string): string {
  let normalized = text.toLowerCase();
  for (const [word, digit] of Object.entries(NUMBER_WORDS)) {
    normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'gi'), digit);
  }
  return normalized.replace(/[^\d]/g, '');
}

/**
 * Analyzes in-meeting text messages against Tutor Plug's platform communication policy.
 */
export function analyzeMessage(
  rawMessage: string,
  options: {
    sensitivity?: 'strict' | 'standard' | 'lenient';
    autoBlock?: boolean;
  } = {}
): ModerationResult {
  const { sensitivity = 'standard', autoBlock = true } = options;
  if (!rawMessage || !rawMessage.trim()) {
    return { isViolation: false, confidence: 0, action: 'pass' };
  }

  const text = rawMessage.trim();
  const lower = text.toLowerCase();

  // 1. Check for standard & formatted phone numbers (e.g. 9876543210, +91 98765 43210, 9876-543210)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
  const directPhoneMatch = text.match(phoneRegex);
  if (directPhoneMatch) {
    const digitsOnly = directPhoneMatch[0].replace(/\D/g, '');
    if (digitsOnly.length >= 10 && digitsOnly.length <= 13) {
      return {
        isViolation: true,
        category: 'phone',
        confidence: 0.95,
        matchedSnippet: directPhoneMatch[0],
        reason: 'Direct phone number detected in message.',
        action: autoBlock ? 'block' : 'flag',
      };
    }
  }

  // Check for disguised phone digits (e.g., 9 8 7 6 5 4 3 2 1 0 or spelled numbers)
  const extractedDigits = extractPotentialDigits(text);
  if (extractedDigits.length >= 10 && extractedDigits.length <= 13) {
    return {
      isViolation: true,
      category: 'phone',
      confidence: 0.88,
      matchedSnippet: text.substring(0, 40),
      reason: 'Disguised or spaced phone number detected.',
      action: autoBlock ? 'block' : 'flag',
    };
  }

  // 2. Check for Email Addresses (standard and obfuscated like 'name [at] gmail [dot] com')
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    return {
      isViolation: true,
      category: 'email',
      confidence: 0.98,
      matchedSnippet: emailMatch[0],
      reason: 'Email address detected.',
      action: autoBlock ? 'block' : 'flag',
    };
  }

  const obfuscatedEmailRegex = /[a-zA-Z0-9._%+-]+\s*(?:\[at\]|\(at\)|\bat\b)\s*[a-zA-Z0-9.-]+\s*(?:\[dot\]|\(dot\)|\bdot\b)\s*[a-zA-Z]{2,}/i;
  const obfuscatedEmailMatch = text.match(obfuscatedEmailRegex);
  if (obfuscatedEmailMatch) {
    return {
      isViolation: true,
      category: 'email',
      confidence: 0.85,
      matchedSnippet: obfuscatedEmailMatch[0],
      reason: 'Obfuscated email address detected.',
      action: autoBlock ? 'block' : 'flag',
    };
  }

  // 3. Check for Payment / UPI handles (e.g. user@okhdfcbank, user@paytm, user@ybl, user@sbi)
  const upiRegex = /[a-zA-Z0-9.\-_]{2,49}@(okhdfcbank|okaxis|okicici|oksbi|paytm|ybl|apl|ibl|axl|barodampay|postbank|upi)\b/i;
  const upiMatch = text.match(upiRegex);
  if (upiMatch) {
    return {
      isViolation: true,
      category: 'payment_upi',
      confidence: 0.98,
      matchedSnippet: upiMatch[0],
      reason: 'Direct UPI payment address detected. Off-platform transactions are strictly prohibited.',
      action: 'block',
    };
  }

  if (lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm') || lower.includes('upi id')) {
    if (/\d{4,}/.test(lower) || lower.includes('@')) {
      return {
        isViolation: true,
        category: 'payment_upi',
        confidence: 0.9,
        matchedSnippet: text,
        reason: 'Payment platform handle or request detected.',
        action: 'block',
      };
    }
  }

  // 4. Check for WhatsApp triggers
  if (lower.includes('whatsapp') || lower.includes('whats app') || lower.includes('wa.me')) {
    return {
      isViolation: true,
      category: 'social_handle',
      confidence: 0.92,
      matchedSnippet: text,
      reason: 'WhatsApp invitation or link detected.',
      action: autoBlock ? 'block' : 'flag',
    };
  }

  // 5. Check for Telegram triggers
  if (lower.includes('telegram') || lower.includes('t.me/')) {
    return {
      isViolation: true,
      category: 'social_handle',
      confidence: 0.92,
      matchedSnippet: text,
      reason: 'Telegram handle or channel link detected.',
      action: autoBlock ? 'block' : 'flag',
    };
  }

  // 6. Check for Instagram handles
  if (lower.includes('instagram.com') || lower.includes('insta:') || (lower.includes('insta') && lower.includes('@'))) {
    return {
      isViolation: true,
      category: 'social_handle',
      confidence: 0.9,
      matchedSnippet: text,
      reason: 'Instagram social profile detected.',
      action: autoBlock ? 'block' : 'flag',
    };
  }

  // 7. General Off-Platform Solicitation Keywords
  const offPlatformPhrases = [
    'call me directly',
    'my personal number',
    'message me privately',
    'connect on zoom',
    'google meet link',
    'pay me directly',
    'outside tutor plug',
    'outside tutorplug',
    'contact me on my cell',
  ];

  for (const phrase of offPlatformPhrases) {
    if (lower.includes(phrase)) {
      return {
        isViolation: true,
        category: 'off_platform',
        confidence: 0.85,
        matchedSnippet: phrase,
        reason: 'Off-platform communication invitation detected.',
        action: sensitivity === 'strict' ? 'block' : 'flag',
      };
    }
  }

  return {
    isViolation: false,
    confidence: 0,
    action: 'pass',
  };
}
