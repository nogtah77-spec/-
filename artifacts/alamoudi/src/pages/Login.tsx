import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, LockKeyhole, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

function hexToRgba(value: string, opacity: number) {
  const normalized = value.replace(/^#/, "");
  const safe = /^[0-9a-f]{6}$/i.test(normalized) ? normalized : "10202D";
  const red = parseInt(safe.slice(0, 2), 16);
  const green = parseInt(safe.slice(2, 4), 16);
  const blue = parseInt(safe.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.min(100, Math.max(0, opacity)) / 100})`;
}

export default function Login() {
  const { login } = useAuth();
  const { settings } = useData();
  const [, navigate] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(identifier, password);
    setSubmitting(false);
    if (result.ok) {
      navigate("/admin");
    } else {
      setError(result.error || "تعذّر تسجيل الدخول");
    }
  };

  const hasBackground = Boolean(settings.loginBackgroundEnabled && settings.loginBackgroundImageUrl);
  const overlayColor = settings.loginOverlayColor || "#10202D";
  const overlay = hexToRgba(overlayColor, settings.loginOverlayOpacity ?? 72);
  const gradient = hexToRgba(overlayColor, settings.loginGradientOpacity ?? 58);

  return (
    <main dir="rtl" className="login-shell relative min-h-[100dvh] overflow-hidden text-[#F5F3EE]">
      <div
        className={`login-backdrop absolute inset-0 bg-cover bg-center bg-no-repeat ${hasBackground ? "" : "login-default-backdrop"}`}
      />
      {hasBackground && (
        <img
          src={settings.loginBackgroundImageUrl}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          className="login-backdrop absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300"
          style={{ opacity: 1 }}
        />
      )}
      {hasBackground && (
        <>
          <div className="login-background-overlay absolute inset-0" style={{ backgroundColor: overlay }} />
          <div
            className="login-background-gradient absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${gradient} 0%, ${hexToRgba(overlayColor, 18)} 45%, transparent 100%)`,
            }}
          />
        </>
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(120deg, transparent 0 48%, rgba(220,190,133,.42) 48.2%, transparent 48.5%), radial-gradient(rgba(255,250,240,.34) .8px, transparent .8px)",
          backgroundSize: "100% 100%, 18px 18px",
        }}
      />

      <div className="login-content relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <section className="login-card w-full max-w-[438px] rounded-[30px] px-5 py-7 sm:px-9 sm:py-9">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex flex-col items-center" data-testid="link-login-brand">
              <span className="login-brand-name text-[#F5F3EE]">العمودي</span>
              <span className="login-brand-subtitle mt-5 border-t border-[#DCC08A]/55 pt-3 text-[0.82rem] font-semibold tracking-[0.14em] text-[#E6CC98]">
                للتسويق العقاري
              </span>
            </Link>
          </div>

          <div className="mb-7 text-center">
            <h1 className="text-[1.65rem] font-semibold tracking-tight text-[#F5F3EE] sm:text-[1.8rem]">
              مرحبًا بعودتك
            </h1>
            <p className="mt-2 text-sm leading-7 text-[#e5e3d9]/75">
              سجّل الدخول للوصول إلى لوحة التحكم.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {error && (
                <div
                  className="flex items-start gap-2 rounded-2xl border border-red-200/30 bg-red-950/25 px-3 py-3 text-sm text-red-100"
                  data-testid="text-login-error"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-semibold text-[#f3ecdd]">
                  اسم المستخدم أو البريد الإلكتروني
                </Label>
                <div className="relative">
                   <UserRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E6CC98]/75" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="admin"
                    autoComplete="username"
                    dir="ltr"
                    className="login-field h-12 rounded-2xl pr-10 text-left text-sm shadow-none"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError("");
                    }}
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-[#f3ecdd]">
                  كلمة المرور
                </Label>
                <div className="relative">
                 <LockKeyhole className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E6CC98]/75" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    dir="ltr"
                    className="login-field h-12 rounded-2xl pr-10 text-left text-sm shadow-none"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    data-testid="input-password"
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
               className="mt-7 h-12 w-full rounded-2xl border border-[#E6CC98]/70 bg-[#B99A68] text-sm font-bold text-[#10202D] shadow-[0_12px_26px_rgba(5,19,24,0.2)] hover:bg-[#C9AB78]"
              data-testid="button-login-submit"
            >
              {submitting ? "جارٍ تسجيل الدخول…" : <>تسجيل الدخول <ArrowLeft className="h-4 w-4" /></>}
            </Button>
              <Link
              href="/"
               className="mt-6 flex items-center justify-center gap-2 text-xs text-[#e8e5d9]/65 transition-colors hover:text-[#E6CC98]"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </form>
          <p className="mt-8 text-center text-[11px] text-[#e8e5d9]/45">
            هذه الصفحة مخصّصة للإدارة والموظفين فقط
          </p>
        </section>
      </div>
    </main>
  );
}