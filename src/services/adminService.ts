import { PlatformSettings } from '@/lib/types';
import { DEFAULT_PLATFORM_SETTINGS } from '@/lib/constants';

class AdminService {
  private settings: PlatformSettings = { ...DEFAULT_PLATFORM_SETTINGS };

  async getPlatformSettings(): Promise<PlatformSettings> {
    return { ...this.settings };
  }

  async updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    this.settings = { ...this.settings, ...updates };
    return { ...this.settings };
  }

  async getStats() {
    return {
      totalStudents: 1420,
      totalTutors: 184,
      verifiedTutors: 162,
      pendingTutors: 22,
      totalBookings: 5890,
      grossVolume: 4780000, // In INR (₹47.8 Lakhs)
      platformCommissionEarned: 1195000, // 25%
      avgRating: 4.92,
      activeToday: 412,
    };
  }
}

export const adminService = new AdminService();
