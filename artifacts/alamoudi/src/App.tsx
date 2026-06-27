import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import { DataProvider } from "@/context/DataContext";
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

      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/properties" component={Properties} />
      <Route path="/admin/properties/new" component={PropertyForm} />
      <Route path="/admin/properties/:id/edit" component={PropertyForm} />
      <Route path="/admin/regions" component={Regions} />
      <Route path="/admin/property-types" component={PropertyTypes} />
      <Route path="/admin/users" component={Users} />
      <Route path="/admin/roles" component={Roles} />
      <Route path="/admin/settings" component={Settings} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/activity-logs" component={ActivityLogs} />
      <Route path="/admin/import-export" component={ImportExport} />
      <Route path="/admin/inquiries" component={Inquiries} />
      <Route path="/admin/property-requests" component={PropertyRequests} />
      <Route path="/admin/finishing-requests" component={FinishingRequests} />
      <Route path="/admin/backup" component={Backup} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <DataProvider>
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
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
