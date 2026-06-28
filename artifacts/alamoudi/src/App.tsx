import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { ComponentType, Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserPrefsProvider } from "@/context/UserPrefsContext";

import Home from "@/pages/Home";
import About from "@/pages/About";
import AddProperty from "@/pages/AddProperty";
import Consultation from "@/pages/Consultation";
import FinishingServices from "@/pages/FinishingServices";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import PropertyDetails from "@/pages/PropertyDetails";
import Favorites from "@/pages/Favorites";
import Compare from "@/pages/Compare";
import Login from "@/pages/Login";

const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Properties = lazy(() => import("@/pages/admin/Properties"));
const PropertyForm = lazy(() => import("@/pages/admin/PropertyForm"));
const Regions = lazy(() => import("@/pages/admin/Regions"));
const PropertyTypes = lazy(() => import("@/pages/admin/PropertyTypes"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Roles = lazy(() => import("@/pages/admin/Roles"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const Analytics = lazy(() => import("@/pages/admin/Analytics"));
const ActivityLogs = lazy(() => import("@/pages/admin/ActivityLogs"));
const ImportExport = lazy(() => import("@/pages/admin/ImportExport"));
const Inquiries = lazy(() => import("@/pages/admin/Inquiries"));
const PropertyRequests = lazy(() => import("@/pages/admin/PropertyRequests"));
const FinishingRequests = lazy(() => import("@/pages/admin/FinishingRequests"));
const Backup = lazy(() => import("@/pages/admin/Backup"));

const queryClient = new QueryClient();

function Protected({ component: Component }: { component: ComponentType }) {
  const { isStaff } = useAuth();
  if (!isStaff) return <Redirect to="/login" />;
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">جارٍ التحميل…</div>}>
      <Component />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/add-property" component={AddProperty} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/finishing-services" component={FinishingServices} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/properties/:id" component={PropertyDetails} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/compare" component={Compare} />
      <Route path="/login" component={Login} />

      <Route path="/admin">{() => <Protected component={Dashboard} />}</Route>
      <Route path="/admin/properties">{() => <Protected component={Properties} />}</Route>
      <Route path="/admin/properties/new">{() => <Protected component={PropertyForm} />}</Route>
      <Route path="/admin/properties/:id/edit">{() => <Protected component={PropertyForm} />}</Route>
      <Route path="/admin/regions">{() => <Protected component={Regions} />}</Route>
      <Route path="/admin/property-types">{() => <Protected component={PropertyTypes} />}</Route>
      <Route path="/admin/users">{() => <Protected component={Users} />}</Route>
      <Route path="/admin/roles">{() => <Protected component={Roles} />}</Route>
      <Route path="/admin/settings">{() => <Protected component={Settings} />}</Route>
      <Route path="/admin/analytics">{() => <Protected component={Analytics} />}</Route>
      <Route path="/admin/activity-logs">{() => <Protected component={ActivityLogs} />}</Route>
      <Route path="/admin/import-export">{() => <Protected component={ImportExport} />}</Route>
      <Route path="/admin/inquiries">{() => <Protected component={Inquiries} />}</Route>
      <Route path="/admin/property-requests">{() => <Protected component={PropertyRequests} />}</Route>
      <Route path="/admin/finishing-requests">{() => <Protected component={FinishingRequests} />}</Route>
      <Route path="/admin/backup">{() => <Protected component={Backup} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <DataProvider>
        <AuthProvider>
          <UserPrefsProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
                <Toaster />
              </TooltipProvider>
            </QueryClientProvider>
          </UserPrefsProvider>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
