'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  requestOtpAction,
  verifyOtpAction,
  registerAction,
  verifyAdminCredentialsAction,
  verifyMentorCredentialsAction,
  verifySecurityAdminChallengeAction,
} from '@/features/auth/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  // Sign In States
  const [step, setStep] = useState<'IDENTIFIER' | 'ADMIN_CREDS' | 'MENTOR_CREDS' | 'SEC_ADMIN_PASSKEY' | 'OTP'>('IDENTIFIER');
  const [emailOrTsId, setEmailOrTsId] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [mentorSecretKey, setMentorSecretKey] = useState('');
  const [mentorPasskey, setMentorPasskey] = useState('');
  const [secAdminPasskey, setSecAdminPasskey] = useState('');
  const [enteredSecAdminKey, setEnteredSecAdminKey] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSecAdminFlow, setIsSecAdminFlow] = useState(false);

  // Sign Up States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Common Feedback States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Switch tabs cleanly
  function handleTabSwitch(tab: 'signin' | 'signup') {
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
  }

  // -------------------------------------------------------------
  // SIGN IN FLOW HANDLERS
  // -------------------------------------------------------------
  async function handleIdentifierSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const cleanInput = emailOrTsId.trim();
    if (!cleanInput) {
      setLoading(false);
      setError('Please enter your Email or TS-ID.');
      return;
    }

    const res = await requestOtpAction(cleanInput);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Account authentication failed. Please check your credentials.');
      return;
    }

    setMaskedEmail(res.maskedEmail || res.email || cleanInput);

    if (res.isSecurityAdminSecretKey) {
      setEnteredSecAdminKey(cleanInput);
      setIsSecAdminFlow(true);
      setStep('SEC_ADMIN_PASSKEY');
    } else if ((res as any).isMentor || (res as any).isMentorSecretKey) {
      setMentorSecretKey(cleanInput);
      setStep('MENTOR_CREDS');
    } else if (res.isAdmin) {
      setStep('ADMIN_CREDS');
    } else {
      setStep('OTP');
      const msg = res.warning
        ? `Verification code dispatched (${res.warning})`
        : `A 6-digit verification code was sent to ${res.maskedEmail}. Check your inbox.`;
      setSuccessMsg(msg);
    }
  }

  async function handleSecAdminPasskeySubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const secretKey = enteredSecAdminKey || emailOrTsId.trim();
    const res = await verifySecurityAdminChallengeAction(secretKey, secAdminPasskey);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Passkey verification failed.');
      return;
    }

    setMaskedEmail(res.maskedEmail || 'Security Admin');
    setStep('OTP');
    setEmailOrTsId(secretKey);
    setSuccessMsg('Passkey verified. 6-digit code dispatched.');
  }

  async function handleAdminCredsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const credRes = await verifyAdminCredentialsAction(emailOrTsId, adminSecretKey, adminPasskey);
    setLoading(false);

    if (!credRes.success) {
      setError(credRes.error || 'Admin verification failed.');
      return;
    }

    setMaskedEmail(credRes.maskedEmail || credRes.email || emailOrTsId);
    setStep('OTP');
    const msg = credRes.warning
      ? `Verification code dispatched (${credRes.warning})`
      : `Verification code dispatched to ${credRes.maskedEmail || 'your admin email'}.`;
    setSuccessMsg(msg);
  }

  async function handleMentorCredsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const credRes = await verifyMentorCredentialsAction(emailOrTsId, mentorSecretKey, mentorPasskey);
    setLoading(false);

    if (!credRes.success) {
      setError(credRes.error || 'Faculty verification failed.');
      return;
    }

    setMaskedEmail(credRes.maskedEmail || credRes.email || emailOrTsId);
    setStep('OTP');
    const msg = credRes.warning
      ? `Verification code dispatched (${credRes.warning})`
      : `Verification code dispatched to ${credRes.maskedEmail || 'your faculty email'}.`;
    setSuccessMsg(msg);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await verifyOtpAction(emailOrTsId, otpCode);

    if (!res.success) {
      setLoading(false);
      setError(res.error || 'Invalid or expired verification code.');
      return;
    }

    // Directly navigate to admin panel or destination workspace
    window.location.href = res.redirectTo || '/admin';
  }

  // -------------------------------------------------------------
  // SIGN UP FLOW HANDLER
  // -------------------------------------------------------------
  async function handleSignUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions to continue.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || fullName.length < 2) {
      setError('Please provide your first and last name.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await registerAction({
      name: fullName,
      email: signupEmail.trim(),
      password: signupPassword,
      confirmPassword: signupPassword,
      careerGoal: `${experienceLevel} Cybersecurity Specialist`,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Registration failed. Please review your details.');
    } else if (res.redirectTo) {
      router.push(res.redirectTo);
    }
  }

  const isLockedOut = error?.includes('Security Lockout Active') || error?.includes('Access blocked for 15 minutes');

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0b0819] text-white font-sans selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-950/30 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* LEFT COLUMN: HERO SHOWCASE (Matching reference design)   */}
      {/* ========================================================= */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[48%] flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-purple-900/20 bg-gradient-to-br from-[#0e0a22] via-[#140c2e] to-[#0a0717]">
        {/* Abstract 3D glowing orbs inspired by the reference image */}
        <div className="absolute top-12 right-16 w-44 h-44 rounded-full bg-gradient-to-b from-purple-500/20 via-purple-700/30 to-[#1e1040] blur-[1px] shadow-[inset_0_2px_12px_rgba(255,255,255,0.15),0_10px_40px_rgba(124,58,237,0.25)] pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-96 rounded-full bg-gradient-to-br from-purple-600/30 via-violet-900/40 to-[#12082b] blur-[2px] shadow-[inset_0_4px_20px_rgba(192,132,252,0.2),0_20px_60px_rgba(88,28,135,0.3)] pointer-events-none transform -rotate-12" />
        <div className="absolute -bottom-24 -left-16 w-[36rem] h-80 rounded-full bg-gradient-to-tr from-purple-900/40 via-indigo-950/60 to-[#0b071a] blur-[2px] shadow-[inset_0_4px_30px_rgba(168,85,247,0.15)] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-600/25 border border-purple-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.35)] group-hover:border-purple-400 transition-all">
              <Shield className="w-5 h-5 text-purple-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-purple-200 transition-colors">
                Thread Security
              </span>
              <span className="text-[11px] font-mono text-purple-300/70 tracking-wider uppercase">
                Cyber Range & Academy
              </span>
            </div>
          </Link>
        </div>

        {/* Hero Headline & Description */}
        <div className="relative z-10 my-auto max-w-lg space-y-6 pt-12">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
              Defend. Challenge. <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
                Elevate.
              </span>
            </h1>
            <p className="text-base xl:text-lg text-purple-200/75 leading-relaxed font-normal">
              Join over 2,800+ security analysts and defenders mastering practical red-team operations, cloud architecture, and real-time incident defense.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="h-8 w-8 rounded-full ring-2 ring-purple-950 bg-gradient-to-tr from-purple-600 to-indigo-500 text-[10px] font-bold flex items-center justify-center text-white">AK</span>
              <span className="h-8 w-8 rounded-full ring-2 ring-purple-950 bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-[10px] font-bold flex items-center justify-center text-white">MR</span>
              <span className="h-8 w-8 rounded-full ring-2 ring-purple-950 bg-gradient-to-tr from-indigo-600 to-blue-500 text-[10px] font-bold flex items-center justify-center text-white">SC</span>
            </div>
            <div className="text-xs text-purple-300/80 font-medium">
              Active community of practitioners & mentors
            </div>
          </div>
        </div>

        {/* Testimonial Quote Pill */}
        <div className="relative z-10 pt-8 border-t border-purple-900/30">
          <div className="flex items-start gap-3.5 max-w-md">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
              Ak
            </div>
            <div className="space-y-1">
              <p className="text-xs italic text-purple-200/90 leading-relaxed font-light">
                &ldquo;The real-world labs and structured offensive security simulations completely transformed how I analyze systems.&rdquo;
              </p>
              <p className="text-[11px] font-medium text-purple-300/80">
                — Amara K., Product Security Specialist
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: INTERACTIVE FORM (Sign In / Sign Up)       */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 xl:p-16 z-10">
        {/* Mobile Header Logo */}
        <div className="lg:hidden w-full max-w-md mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/25 border border-purple-500/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-300" />
            </div>
            <span className="text-base font-bold text-white">Thread Security</span>
          </Link>
          <span className="text-xs text-purple-300/70 font-mono">Academic Portal</span>
        </div>

        <div className="w-full max-w-[440px] space-y-7">
          {/* Header titles */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {activeTab === 'signin' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-xs sm:text-sm text-purple-300/70">
              {activeTab === 'signin'
                ? 'Access your cyber range, labs, and security clearance.'
                : "Join Thread Security Academy — It's free"}
            </p>
          </div>

          {/* Tab Switcher (Sign In vs Sign Up) */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#150f2f] border border-purple-500/20 shadow-inner">
            <button
              type="button"
              onClick={() => handleTabSwitch('signin')}
              className={`py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(124,58,237,0.3)]'
                  : 'text-purple-300/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(124,58,237,0.3)]'
                  : 'text-purple-300/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                isLockedOut
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}
            >
              {isLockedOut ? (
                <Lock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 1: SIGN IN VIEW                                  */}
          {/* ===================================================== */}
          {activeTab === 'signin' && (
            <div className="space-y-6">
              {step === 'IDENTIFIER' && (
                <form onSubmit={handleIdentifierSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-purple-200/90">
                      Email Address or TS-ID
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={emailOrTsId}
                        onChange={(e) => setEmailOrTsId(e.target.value)}
                        placeholder="you@example.com or TS-ID"
                        className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all text-sm"
                        required
                        autoFocus
                      />
                      <Mail className="w-4 h-4 text-purple-400/40 absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || isLockedOut}
                    className="w-full h-11 bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
                  >
                    {loading ? 'Authenticating...' : 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}

              {step === 'OTP' && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-purple-200/90">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('IDENTIFIER');
                          setIsSecAdminFlow(false);
                          setError(null);
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Change ID
                      </button>
                    </div>

                    <Input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="• • • • • •"
                      className="h-14 bg-[#171032]/90 border-purple-500/30 text-center text-2xl tracking-[0.4em] font-mono text-purple-200 placeholder:text-purple-400/30 rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all font-bold"
                      required
                      autoFocus
                    />
                    <span className="text-[11px] text-purple-300/60 block text-center pt-1">
                      Sent to <strong className="text-purple-200">{maskedEmail}</strong>
                    </span>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || isLockedOut}
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? 'Verifying...' : 'Complete Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}

              {step === 'ADMIN_CREDS' && (
                <form onSubmit={handleAdminCredsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-purple-200/90">
                      <KeyRound className="w-3.5 h-3.5 text-purple-400" /> Admin Secret Key
                    </label>
                    <Input
                      type="password"
                      value={adminSecretKey}
                      onChange={(e) => setAdminSecretKey(e.target.value)}
                      placeholder="Secret Key"
                      className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 focus:border-purple-400 text-sm"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-purple-200/90">
                      <Lock className="w-3.5 h-3.5 text-purple-400" /> Admin Passkey
                    </label>
                    <Input
                      type="password"
                      value={adminPasskey}
                      onChange={(e) => setAdminPasskey(e.target.value)}
                      placeholder="Passkey"
                      className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 focus:border-purple-400 text-sm"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('IDENTIFIER')}
                      className="w-1/3 h-11 border-purple-500/30 bg-[#171032]/50 text-purple-200 hover:bg-purple-900/30 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || isLockedOut}
                      className="w-2/3 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.35)]"
                    >
                      {loading ? 'Verifying...' : 'Verify Access'}
                    </Button>
                  </div>
                </form>
              )}

              {step === 'MENTOR_CREDS' && (
                <form onSubmit={handleMentorCredsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-purple-200/90">
                      <Lock className="w-3.5 h-3.5 text-purple-400" /> Faculty Secret Key
                    </label>
                    <Input
                      type="text"
                      value={mentorSecretKey}
                      onChange={(e) => setMentorSecretKey(e.target.value)}
                      placeholder="Secret Key"
                      className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 focus:border-purple-400 uppercase font-mono text-sm"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-purple-200/90">
                      <KeyRound className="w-3.5 h-3.5 text-purple-400" /> Faculty Passkey
                    </label>
                    <Input
                      type="password"
                      value={mentorPasskey}
                      onChange={(e) => setMentorPasskey(e.target.value)}
                      placeholder="Passkey"
                      className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 focus:border-purple-400 text-sm"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('IDENTIFIER')}
                      className="w-1/3 h-11 border-purple-500/30 bg-[#171032]/50 text-purple-200 hover:bg-purple-900/30 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || isLockedOut}
                      className="w-2/3 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.35)]"
                    >
                      {loading ? 'Validating...' : 'Verify Faculty Access'}
                    </Button>
                  </div>
                </form>
              )}

              {step === 'SEC_ADMIN_PASSKEY' && (
                <form onSubmit={handleSecAdminPasskeySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-purple-200/90">
                      <KeyRound className="w-3.5 h-3.5 text-purple-400" /> Security Passkey
                    </label>
                    <Input
                      type="password"
                      value={secAdminPasskey}
                      onChange={(e) => setSecAdminPasskey(e.target.value)}
                      placeholder="Passkey"
                      className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 focus:border-purple-400 text-sm"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep('IDENTIFIER');
                        setIsSecAdminFlow(false);
                        setError(null);
                      }}
                      className="w-1/3 h-11 border-purple-500/30 bg-[#171032]/50 text-purple-200 hover:bg-purple-900/30 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || isLockedOut}
                      className="w-2/3 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.35)]"
                    >
                      {loading ? 'Verifying...' : 'Verify & Send OTP'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Social Login Options */}
              {step === 'IDENTIFIER' && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-purple-500/20 flex-1" />
                    <span className="text-[11px] text-purple-300/50 tracking-wider font-medium">
                      or continue with
                    </span>
                    <div className="h-px bg-purple-500/20 flex-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setError('Institutional single-sign-on is managed via your registered student email or TS-ID.')}
                      className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-[#171032]/60 hover:bg-purple-950/40 border border-purple-500/20 text-xs font-medium text-purple-200/90 transition-all hover:border-purple-500/40"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Continue with Google
                    </button>

                    <button
                      type="button"
                      onClick={() => setError('GitHub access is linked to student repositories. Please sign in with your student email above.')}
                      className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-[#171032]/60 hover:bg-purple-950/40 border border-purple-500/20 text-xs font-medium text-purple-200/90 transition-all hover:border-purple-500/40"
                    >
                      <svg className="w-4 h-4 fill-current shrink-0 text-white" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      Continue with GitHub
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom toggle prompt */}
              <div className="text-center pt-2">
                <p className="text-xs text-purple-300/70">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('signup')}
                    className="text-purple-400 font-semibold hover:text-purple-300 hover:underline transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 2: SIGN UP VIEW (Matching reference mockup)      */}
          {/* ===================================================== */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-purple-200/90">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 focus:border-purple-400 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-purple-200/90">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 focus:border-purple-400 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-purple-200/90">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 focus:border-purple-400 text-sm"
                    required
                  />
                  <Mail className="w-4 h-4 text-purple-400/40 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-purple-200/90">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password (min 8 chars)"
                    className="h-11 bg-[#171032]/80 border-purple-500/25 text-white placeholder:text-purple-300/30 rounded-xl px-3.5 pr-10 focus:border-purple-400 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-purple-400/50 hover:text-purple-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Experience Level Selector (Matching Reference Image) */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-purple-200/90">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => {
                    const isSelected = experienceLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperienceLevel(lvl)}
                        className={`py-2 px-2 text-xs rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-400 text-white font-medium shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                            : 'bg-[#171032]/50 border-purple-500/20 text-purple-300/70 hover:text-white hover:border-purple-500/40'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-purple-400 shadow-[0_0_6px_#c084fc]' : 'bg-purple-400/30'
                          }`}
                        />
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-purple-300/80 select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-purple-500/30 bg-[#171032] text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" className="text-purple-400 hover:text-purple-300 hover:underline">
                      Terms & Conditions
                    </Link>{' '}
                    and Privacy Policy.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all flex items-center justify-center gap-2 text-sm pt-1"
              >
                {loading ? 'Creating Account & TS-ID...' : 'Join the Academy'}
                <ArrowRight className="w-4 h-4" />
              </Button>

              {/* Social Login Options */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-3">
                  <div className="h-px bg-purple-500/20 flex-1" />
                  <span className="text-[11px] text-purple-300/50 tracking-wider font-medium">
                    or continue with
                  </span>
                  <div className="h-px bg-purple-500/20 flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setError('Institutional single-sign-on is managed via your registered student email or TS-ID.')}
                    className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-[#171032]/60 hover:bg-purple-950/40 border border-purple-500/20 text-xs font-medium text-purple-200/90 transition-all hover:border-purple-500/40"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    onClick={() => setError('GitHub access is tied to institutional licenses. Please sign in with your student email above.')}
                    className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-[#171032]/60 hover:bg-purple-950/40 border border-purple-500/20 text-xs font-medium text-purple-200/90 transition-all hover:border-purple-500/40"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0 text-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    Continue with GitHub
                  </button>
                </div>
              </div>

              {/* Bottom toggle prompt */}
              <div className="text-center pt-2">
                <p className="text-xs text-purple-300/70">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('signin')}
                    className="text-purple-400 font-semibold hover:text-purple-300 hover:underline transition-colors"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0819] flex items-center justify-center text-purple-300">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
