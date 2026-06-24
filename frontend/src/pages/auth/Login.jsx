import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import useAuthStore from '@/stores/authStore';

export default function Login() {
  const { user, loading, loginWithGoogle, error, clearError } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? '/';

  // Phone OTP state
  const [tab,         setTab]         = useState('google'); // 'google' | 'phone'
  const [phone,       setPhone]       = useState('');
  const [otp,         setOtp]         = useState('');
  const [otpSent,     setOtpSent]     = useState(false);
  const [confirmObj,  setConfirmObj]  = useState(null);
  const [phoneError,  setPhoneError]  = useState('');
  const [phoneBusy,   setPhoneBusy]   = useState(false);
  const recaptchaRef = useRef(null);
  const recaptchaWidgetRef = useRef(null);

  useEffect(() => {
    clearError();
  }, [tab]); // eslint-disable-line

  // Redirect once logged in
  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  async function handleGoogle() {
    await loginWithGoogle();
    // onAuthStateChanged in authStore handles navigation via React re-render
  }

  async function setupRecaptcha() {
    if (!recaptchaWidgetRef.current) {
      recaptchaWidgetRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
      });
      await recaptchaWidgetRef.current.render();
    }
    return recaptchaWidgetRef.current;
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setPhoneError('');
    const cleaned = phone.replace(/\s/g, '');
    if (!/^\+[1-9]\d{9,14}$/.test(cleaned)) {
      setPhoneError('Enter a valid phone number with country code, e.g. +919876543210');
      return;
    }
    setPhoneBusy(true);
    try {
      const verifier = await setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, cleaned, verifier);
      setConfirmObj(confirmation);
      setOtpSent(true);
    } catch (err) {
      setPhoneError(err.message);
    } finally {
      setPhoneBusy(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (!confirmObj) return;
    setPhoneBusy(true);
    try {
      await confirmObj.confirm(otp);
      // onAuthStateChanged handles the rest
    } catch (err) {
      setPhoneError('Incorrect code. Try again.');
    } finally {
      setPhoneBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="theme-panel rounded-2xl p-8 w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm theme-muted mt-1">to Rashmi Shree</p>
        </div>

        {/* Tab selector */}
        <div className="flex rounded-lg overflow-hidden border border-white/10 text-sm">
          {['google', 'phone'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 transition-colors ${
                tab === t ? 'bg-brand-pink/20 text-brand-pink font-medium' : 'theme-muted'
              }`}
            >
              {t === 'google' ? 'Google' : 'Phone OTP'}
            </button>
          ))}
        </div>

        {(error) && (
          <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        {tab === 'google' && (
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
              <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.68 28.18A13.94 13.94 0 0 1 10.8 24c0-1.45.25-2.85.68-4.18v-5.7H4.34A23.93 23.93 0 0 0 0 24c0 3.86.92 7.51 2.56 10.76l7.12-5.7z"/>
              <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.34 5.7C13.42 14.62 18.27 10.75 24 10.75z"/>
            </svg>
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>
        )}

        {tab === 'phone' && (
          <div className="flex flex-col gap-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs theme-muted block mb-1">Phone number</label>
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
                  />
                </div>
                {phoneError && <p className="text-red-400 text-xs">{phoneError}</p>}
                <button
                  type="submit"
                  disabled={phoneBusy}
                  className="w-full bg-brand-pink hover:bg-brand-pink-strong text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {phoneBusy ? 'Sending…' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <p className="text-xs theme-muted">Enter the 6-digit code sent to {phone}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm tracking-widest focus:outline-none focus:border-brand-pink"
                />
                {phoneError && <p className="text-red-400 text-xs">{phoneError}</p>}
                <button
                  type="submit"
                  disabled={phoneBusy}
                  className="w-full bg-brand-pink hover:bg-brand-pink-strong text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {phoneBusy ? 'Verifying…' : 'Verify & sign in'}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                  className="text-xs theme-muted hover:text-white"
                >
                  ← Change number
                </button>
              </form>
            )}
          </div>
        )}

        {/* Invisible reCAPTCHA mount point */}
        <div ref={recaptchaRef} />
      </div>
    </div>
  );
}
