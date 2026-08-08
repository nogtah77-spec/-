import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main
      dir="rtl"
      className="login-shell relative min-h-[100dvh] overflow-hidden bg-[#eef0ed] px-4 py-6 text-foreground sm:px-6 lg:px-10"
    >
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${
          hasBackground
            ? ""
            : "bg-[radial-gradient(circle_at_12%_14%,rgba(180,152,107,0.18),transparent_28%),linear-gradient(135deg,#eef0ed,#dce4e1)]"
        }`}
        style={hasBackground ? { backgroundImage: `url("${settings.loginBackgroundImageUrl}")` } : undefined}
      />
      {hasBackground && (
        <>
          <div className="absolute inset-0" style={{ backgroundColor: overlay }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${gradient} 0%, ${hexToRgba(overlayColor, 18)} 45%, transparent 100%)` }} />
        </>
      )}
      <div className="absolute inset-0 pointer-events-none opacity-[0.16]" style={{ backgroundImage: "linear-gradient(120deg, transparent 0 48%, rgba(180,152,107,.35) 48.2%, transparent 48.5%), radial-gradient(rgba(16,32,45,.22) .8px, transparent .8px)", backgroundSize: "100% 100%, 18px 18px" }} />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-center justify-center">
        <div className={`grid w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-white/60 bg-[#f9faf8]/90 shadow-[0_24px_80px_rgba(16,32,45,0.18)] backdrop-blur-xl lg:grid-cols-[1fr_0.9fr] ${hasBackground ? "lg:bg-[#f9faf8]/95" : ""}`}>
          <section className="hidden min-h-[600px] flex-col justify-between bg-[#10202d] p-10 text-[#f5f1e8] lg:flex xl:p-14">
            <div>
              <div className="mb-12 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center border border-[#b4986b]/70 text-lg font-bold text-[#d8bd87]">ع</span>
                <div>
                  <div className="text-xl font-bold leading-none">العمودي</div>
                  <div className="mt-1 text-[11px] tracking-[0.18em] text-[#d8bd87]">للتسويق العقاري</div>
                </div>
              </div>
              <p className="max-w-sm text-sm leading-8 text-[#d5ddd9]">
                مساحة عمل هادئة لإدارة الفرص، ومتابعة العملاء، وصناعة قرارات عقارية أوضح.
              </p>
            </div>
            <div>
              <div className="mb-5 h-px w-20 bg-[#b4986b]" />
              <p className="max-w-xs text-xs leading-7 text-[#aebdb8]">بوابة آمنة لفريق العمودي وشركائه المعتمدين.</p>
            </div>
          </section>

          <section className="flex items-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12">
            <div className="mx-auto w-full max-w-[390px]">
              <div className="mb-8 lg:hidden">
                <Link href="/" className="inline-flex items-center gap-3" data-testid="link-login-brand">
                  <span className="flex h-10 w-10 items-center justify-center border border-[#b4986b] bg-[#10202d] text-base font-bold text-[#d8bd87]">ع</span>
                  <span className="text-right">
                    <span className="block text-2xl font-bold leading-none text-[#10202d]">العمودي</span>
                    <span className="mt-1 block text-[11px] tracking-[0.16em] text-[#8b6c3d]">للتسويق العقاري</span>
                  </span>
                </Link>
              </div>
              <div className="mb-8">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#b4986b]/15 text-[#8b6c3d]">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#10202d] sm:text-[28px]">مرحبًا بعودتك</h1>
                <p className="mt-2 text-sm leading-7 text-[#68756f]">سجّل الدخول للوصول إلى لوحة التحكم.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-3 text-sm text-destructive" data-testid="text-login-error">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-sm font-semibold text-[#30413e]">اسم المستخدم أو البريد الإلكتروني</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9892]" />
                      <Input id="identifier" type="text" placeholder="admin" autoComplete="username" dir="ltr" className="h-12 rounded-xl border-[#d9e0dc] bg-white/80 pr-10 text-left text-sm shadow-none" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(""); }} data-testid="input-email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-[#30413e]">كلمة المرور</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9892]" />
                      <Input id="password" type="password" autoComplete="current-password" dir="ltr" className="h-12 rounded-xl border-[#d9e0dc] bg-white/80 pr-10 text-left text-sm shadow-none" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} data-testid="input-password" />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={submitting} className="mt-7 h-12 w-full rounded-xl bg-[#10202d] text-sm font-semibold text-[#f5f1e8] shadow-[0_10px_22px_rgba(16,32,45,0.16)] hover:bg-[#1b3748]" data-testid="button-login-submit">
                  {submitting ? "جارٍ تسجيل الدخول…" : <>تسجيل الدخول <ArrowLeft className="h-4 w-4" /></>}
                </Button>
                <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-xs text-[#71807a] transition-colors hover:text-[#8b6c3d]">
                  العودة إلى الصفحة الرئيسية
                </Link>
              </form>
              <p className="mt-10 text-center text-[11px] text-[#9aa59f]">هذه الصفحة مخصّصة للإدارة والموظفين فقط</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
