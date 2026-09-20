'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminService } from '@/services/adminService';
import { PlatformSettings } from '@/lib/types';
import { Settings, Percent, DollarSign, Check, ShieldCheck, Radio, PhoneCall, Send, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    commission_percentage: 25,
    currency: 'INR',
    min_fee: 50,
    enable_instant_booking: true,
  });

  const [isSaved, setIsSaved] = useState(false);

  // SMS Gateway state
  const [smsProvider, setSmsProvider] = useState<'fast2sms' | '2factor' | 'twilio'>('fast2sms');
  const [smsApiKey, setSmsApiKey] = useState('');
  const [isSmsActive, setIsSmsActive] = useState(true);
  const [currentSmsStatus, setCurrentSmsStatus] = useState<any>(null);
  const [smsSaveMessage, setSmsSaveMessage] = useState('');
  const [testPhone, setTestPhone] = useState('7209691128');
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [testSmsFeedback, setTestSmsFeedback] = useState<any>(null);

  const fetchSmsStatus = async () => {
    try {
      const res = await fetch('/api/admin/sms');
      const data = await res.json();
      if (data.success) {
        setCurrentSmsStatus(data);
        if (data.config?.provider) setSmsProvider(data.config.provider);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    async function load() {
      const s = await adminService.getPlatformSettings();
      setSettings(s);
      fetchSmsStatus();
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.updatePlatformSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveSmsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsApiKey.trim()) {
      setSmsSaveMessage('Please enter a valid API key.');
      return;
    }
    try {
      const res = await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: smsProvider,
          api_key: smsApiKey.trim(),
          is_active: isSmsActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmsSaveMessage('SMS Gateway saved! Real cellular SMS is active.');
        fetchSmsStatus();
        setSmsApiKey('');
        setTimeout(() => setSmsSaveMessage(''), 4000);
      }
    } catch {
      setSmsSaveMessage('Failed to save SMS configuration.');
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhone) return;
    setIsTestingSms(true);
    setTestSmsFeedback(null);
    try {
      const res = await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_phone: testPhone,
        }),
      });
      const data = await res.json();
      setTestSmsFeedback(data.testResult);
    } catch {
      setTestSmsFeedback({ success: false, message: 'Connection error during test SMS.' });
    }
    setIsTestingSms(false);
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Platform Configuration & Economics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure system-wide business rules, platform take rates, and feature toggles.
          </p>
        </div>

        {isSaved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Platform settings saved! Changes applied to all future booking calculations.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Commission Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Platform Take Rate (Commission)
            </h3>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Platform Commission:</span>
                <span className="text-indigo-600 text-base font-black">
                  {settings.commission_percentage}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={settings.commission_percentage}
                onChange={(e) =>
                  setSettings({ ...settings, commission_percentage: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>5% (Subsidized)</span>
                <span>25% (Standard Default)</span>
                <span>40% (Premium)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2">
              <span className="font-bold text-slate-800 block">Example Payout Preview on ₹1,000 Class:</span>
              <div className="flex justify-between text-[11px]">
                <span>Student Pays:</span>
                <span className="font-bold text-slate-900">₹1,000</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Platform Fee ({settings.commission_percentage}%):</span>
                <span className="font-bold text-indigo-600">
                  ₹{Math.round((1000 * settings.commission_percentage) / 100)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] border-t border-slate-200 pt-1 font-bold">
                <span>Tutor Payout ({100 - settings.commission_percentage}%):</span>
                <span className="text-emerald-600">
                  ₹{1000 - Math.round((1000 * settings.commission_percentage) / 100)}
                </span>
              </div>
            </div>
          </div>

          {/* Currency & Thresholds */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Currency & Safeguards
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Platform Operating Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ United States Dollar)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                  <option value="AED">AED (United Arab Emirates Dirham)</option>
                </select>
              </div>

              <div>
                <Input
                  label="Minimum Platform Fee"
                  type="number"
                  value={settings.min_fee}
                  onChange={(e) => setSettings({ ...settings, min_fee: Number(e.target.value) })}
                  helperText="Floor fee applied per completed session."
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="gradient" size="md">
            Save Platform Settings
          </Button>
        </form>

        {/* Video Classroom Privacy & Recording Retention (Section 26 & 38) */}
        <ClassroomPolicySettingsSection />

        {/* SMS Gateway & Telecom Integration */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  SMS & Telecom Gateway (Real Phone OTPs)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure Fast2SMS or 2Factor to deliver real-time SMS verification codes directly to mobile phones (+91).
              </p>
            </div>

            <div className="shrink-0">
              {currentSmsStatus?.isConfigured ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live SMS Active ({currentSmsStatus.activeProvider})
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  No Gateway Configured
                </div>
              )}
            </div>
          </div>

          {smsSaveMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{smsSaveMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveSmsConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  SMS Gateway Provider
                </label>
                <select
                  value={smsProvider}
                  onChange={(e: any) => setSmsProvider(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                >
                  <option value="fast2sms">Fast2SMS (Recommended for India — fast2sms.com)</option>
                  <option value="2factor">2Factor.in (Instant OTP for India — 2factor.in)</option>
                  <option value="twilio">Twilio (Global Cellular SMS — twilio.com)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gateway API Key / Authorization Token
                </label>
                <Input
                  type="password"
                  placeholder={currentSmsStatus?.config?.masked_key ? `Current: ${currentSmsStatus.config.masked_key}` : 'Paste Authorization API Key here'}
                  value={smsApiKey}
                  onChange={(e) => setSmsApiKey(e.target.value)}
                  helperText="Key is stored securely on your server."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="smsActiveCheckbox"
                  checked={isSmsActive}
                  onChange={(e) => setIsSmsActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="smsActiveCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Enable cellular SMS dispatching for all new registrations & logins
                </label>
              </div>

              <Button type="submit" variant="gradient" size="sm">
                Save SMS Key
              </Button>
            </div>
          </form>

          {/* Real Phone Test Dispatcher */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-indigo-600" />
              Test Live SMS Delivery to Your Mobile Phone
            </h3>
            <p className="text-xs text-slate-500">
              Enter your mobile number to verify that cellular radio towers deliver the SMS to your physical device.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="e.g. 7209691128"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleSendTestSms}
                isLoading={isTestingSms}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send Test SMS Now
              </Button>
            </div>

            {testSmsFeedback && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testSmsFeedback.delivered
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {testSmsFeedback.delivered ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Success!</strong> Real SMS verification code was dispatched to <strong>{testPhone}</strong> via <strong>{testSmsFeedback.provider}</strong>. Check your phone notifications!
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      {testSmsFeedback.message || 'SMS delivery failed. Please verify your API key.'}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick instructions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              How to get a free Fast2SMS API key (Takes 60 seconds):
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
              <li>Open <a href="https://www.fast2sms.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">fast2sms.com</a> and sign up with your Indian phone number.</li>
              <li>In your Fast2SMS Dashboard, click on <strong>&quot;Dev API&quot;</strong> in the left menu.</li>
              <li>Copy the <strong>Authorization Key</strong> and paste it in the box above, then click <strong>Save SMS Key</strong>.</li>
            </ol>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ClassroomPolicySettingsSection() {
  const [policySettings, setPolicySettings] = useState({
    recording_retention_days: 90,
    chat_retention_days: 180,
    file_retention_days: 90,
    moderation_sensitivity: 'standard' as 'strict' | 'standard' | 'lenient',
    auto_block_contact_info: true,
    allow_student_screen_share_default: true,
    recording_mandatory_default: true,
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.policySettings) {
          setPolicySettings(data.policySettings);
        }
      } catch (err) {
        console.error('Failed to load policy settings:', err);
      }
    }
    load();
  }, []);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policySettings),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save policy settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <span>Classroom Recording Retention & Privacy Safeguards</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated recording lifecycles, chat retention, and off-platform contact detection rules.
          </p>
        </div>
        {isSaved && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            <span>Saved!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSavePolicy} className="space-y-5 text-xs">
        {/* Retention Policy (Section 26) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Recording Retention Period (Days)
            </label>
            <select
              value={policySettings.recording_retention_days}
              onChange={(e) =>
                setPolicySettings({
                  ...policySettings,
                  recording_retention_days: parseInt(e.target.value, 10),
                })
              }
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 bg-white"
            >
              <option value={30}>30 Days (Minimal Storage)</option>
              <option value={90}>90 Days (Recommended Standard)</option>
              <option value={180}>180 Days (Half Year)</option>
              <option value={365}>365 Days (1 Year Legal Compliance)</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Recordings are securely purged or archived once retention expires.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Chat & Shared Files Retention (Days)
            </label>
            <select
              value={policySettings.chat_retention_days}
              onChange={(e) =>
                setPolicySettings({
                  ...policySettings,
                  chat_retention_days: parseInt(e.target.value, 10),
                })
              }
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 bg-white"
            >
              <option value={90}>90 Days</option>
              <option value={180}>180 Days (Recommended)</option>
              <option value={365}>365 Days</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Persistent message logs and student homework images retention.
            </span>
          </div>
        </div>

        {/* Moderation Sensitivity & Blocking Toggle (Sections 21 & 22) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Contact-Sharing Moderation Sensitivity
            </label>
            <select
              value={policySettings.moderation_sensitivity}
              onChange={(e: any) =>
                setPolicySettings({
                  ...policySettings,
                  moderation_sensitivity: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 bg-white"
            >
              <option value="strict">Strict (Blocks spaced numbers, partial handles, & phrases)</option>
              <option value="standard">Standard (Recommended - detects standard phones, emails, UPI)</option>
              <option value="lenient">Lenient (Only detects explicit 10-digit phones & direct emails)</option>
            </select>
          </div>

          <div className="space-y-2 pt-4 sm:pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={policySettings.auto_block_contact_info}
                onChange={(e) =>
                  setPolicySettings({
                    ...policySettings,
                    auto_block_contact_info: e.target.checked,
                  })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="font-semibold text-slate-800">
                Instantly block messages containing contact information
              </span>
            </label>
            <span className="text-[10px] text-slate-500 block pl-6">
              When disabled, messages are delivered but automatically flagged in the Admin Review Queue.
            </span>
          </div>
        </div>

        {/* Classroom Defaults */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policySettings.recording_mandatory_default}
              onChange={(e) =>
                setPolicySettings({
                  ...policySettings,
                  recording_mandatory_default: e.target.checked,
                })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="font-semibold text-slate-800">
              Mandatory recording required for all tutoring classes by default
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policySettings.allow_student_screen_share_default}
              onChange={(e) =>
                setPolicySettings({
                  ...policySettings,
                  allow_student_screen_share_default: e.target.checked,
                })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="font-semibold text-slate-800">
              Allow student screen sharing by default (Instructors can restrict per class)
            </span>
          </label>
        </div>

        <Button type="submit" variant="gradient" size="sm" disabled={isSaving}>
          {isSaving ? 'Saving Policies...' : 'Save Privacy & Retention Policies'}
        </Button>
      </form>
    </div>
  );
}
