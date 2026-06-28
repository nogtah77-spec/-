import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { ComponentType } from "react";
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

import Dashboard from "@/pages/admin/Dashboard";
import Properties from "@/pages/admin/Properties";
import PropertyForm from "@/pages/admin/PropertyForm";
import Regions from "@/pages/admin/Regions";
import PropertyTypes from "@/pages/admin/PropertyTypes";
import Users from "@/pages/admin/Users";
import Roles from "@/pages/admin/Roles";
import Settings from "@/pages/admin/Settings";
import Analytics from "@/pages/admin/Analytics";
import ActivityLogs from "@/pages/admin/ActivityLogs";
import ImportExport from "@/pages/admin/ImportExport";
import Inquiries from "@/pages/admin/Inquiries";
import PropertyRequests from "@/pages/admin/PropertyRequests";
import FinishingRequests from "@/pages/admin/FinishingRequests";
import Backup from "@/pages/admin/Backup";

const queryClient = new QueryClient();

function Protected({ component: Component }: { component: ComponentType }) {
  const { isStaff } = useAuth();
  if (!isStaff) return <Redirect to="/login" />;
  return <Component />;
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
