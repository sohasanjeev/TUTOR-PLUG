import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export function getFirebaseClientApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) return null;

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  const clientApp = getFirebaseClientApp();
  if (!clientApp) return null;

  if (!auth) {
    auth = getAuth(clientApp);
  }
  return auth;
}

// Global reference for confirmation result across form steps
let confirmationResultRef: ConfirmationResult | null = null;
let recaptchaVerifierRef: RecaptchaVerifier | null = null;

export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  containerId: string = 'recaptcha-container'
): Promise<{ success: boolean; message?: string }> {
  try {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      return {
        success: false,
        message: 'Firebase is not yet configured. Please set Firebase environment variables.',
      };
    }

    // Format phone to E.164 (+91XXXXXXXXXX)
    const digits = phoneNumber.replace(/\D/g, '');
    const cleanNumber = digits.length === 10 ? `+91${digits}` : digits.startsWith('91') && digits.length === 12 ? `+${digits}` : `+${digits}`;

    // Initialize invisible reCAPTCHA if not already created
    if (!recaptchaVerifierRef) {
      recaptchaVerifierRef = new RecaptchaVerifier(authInstance, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          if (recaptchaVerifierRef) {
            try {
              recaptchaVerifierRef.clear();
            } catch {}
            recaptchaVerifierRef = null;
          }
        },
      });
    }

    const confirmation = await signInWithPhoneNumber(authInstance, cleanNumber, recaptchaVerifierRef);
    confirmationResultRef = confirmation;

    return {
      success: true,
      message: `Verification code sent to ${cleanNumber} via Google SMS.`,
    };
  } catch (error: any) {
    console.error('Firebase Phone Auth Error:', error);
    // Reset reCAPTCHA on error so retry works
    if (recaptchaVerifierRef) {
      try {
        recaptchaVerifierRef.clear();
      } catch {}
      recaptchaVerifierRef = null;
    }
    return {
      success: false,
      message: error?.message || 'Failed to dispatch SMS via Google Firebase.',
    };
  }
}

export async function confirmFirebasePhoneOtp(
  otpCode: string
): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    if (!confirmationResultRef) {
      return {
        success: false,
        message: 'No pending SMS verification found. Please request a new OTP.',
      };
    }

    const result = await confirmationResultRef.confirm(otpCode.trim());
    return {
      success: true,
      user: result.user,
    };
  } catch (error: any) {
    console.error('Firebase Confirmation Error:', error);
    return {
      success: false,
      message: error?.message || 'Invalid or expired OTP code.',
    };
  }
}
