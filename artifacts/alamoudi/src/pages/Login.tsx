import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
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
            <CardTitle className="text-xl font-bold text-foreground">تسجيل الدخول</CardTitle>
            <CardDescription className="text-sm">أدخل بياناتك للوصول إلى حسابك</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                dir="ltr"
                className="text-left h-10 text-sm"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                dir="ltr"
                className="h-10 text-sm"
                data-testid="input-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
            <Button
              asChild
              className="w-full h-10 bg-accent text-white hover:bg-accent/90 font-medium text-sm"
              data-testid="button-login-submit"
            >
              <Link href="/admin">تسجيل الدخول</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-accent font-medium hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
