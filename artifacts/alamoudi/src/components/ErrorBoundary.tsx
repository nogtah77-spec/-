import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack, "path:", window.location.pathname);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6" dir="rtl">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">حصل خطأ غير متوقع</h1>
            <p className="text-muted-foreground mb-7 text-sm leading-relaxed">
              نأسف على الإزعاج، حصلت مشكلة مؤقتة. جرّب تحديث الصفحة أو الرجوع للرئيسية.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="rounded-full px-7 py-2.5 text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors shadow-md"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={this.handleHome}
                className="rounded-full px-7 py-2.5 text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
