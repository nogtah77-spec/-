import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(identifier, password);
    if (result.ok) {
      navigate("/admin");
    } else {
      setError(result.error || "تعذّر تسجيل الدخول");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#A27B5B 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block" data-testid="link-login-brand">
            <div className="text-3xl font-bold text-primary dark:text-foreground tracking-tight mb-1">
              العمودي
            </div>
            <div className="text-sm font-light text-muted-foreground tracking-widest">
              للتسويق العقاري
            </div>
          </Link>
          <div className="w-8 h-0.5 bg-accent mx-auto mt-3" />
        </div>

        <Card className="border-border/60 shadow-luxury-lg card-luxury">
          <CardHeader className="space-y-1 text-center pb-5">
            <CardTitle className="text-xl font-bold text-foreground">دخول لوحة التحكم</CardTitle>
            <CardDescription className="text-sm">هذه الصفحة مخصّصة للإدارة والموظفين فقط</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2" data-testid="text-login-error">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium">اسم المستخدم أو البريد الإلكتروني</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="admin"
                  dir="ltr"
                  className="text-left h-10 text-sm"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  dir="ltr"
                  className="h-10 text-sm"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  data-testid="input-password"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
              <Button
                type="submit"
                className="w-full h-10 bg-accent text-white hover:bg-accent/90 font-medium text-sm"
                data-testid="button-login-submit"
              >
                تسجيل الدخول
              </Button>
              <Link href="/" className="text-center text-xs text-muted-foreground hover:text-accent">
                العودة إلى الصفحة الرئيسية
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
