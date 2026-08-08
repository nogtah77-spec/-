import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Clock3,
  FileText,
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useData, type AiLead, type FinishingRequest, type Inquiry, type PropertyRequest } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";

type RequestKind = "inquiry" | "property" | "finishing" | "ai";
type RequestStatus = "new" | "reviewed" | "replied";

interface CustomerRequest {
  id: string;
  kind: RequestKind;
  status: RequestStatus;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  headline: string;
  summary: string;
  tags: string[];
  details: Array<{ label: string; value: string }>;
}

const KIND_META: Record<RequestKind, { label: string; shortLabel: string; icon: typeof Inbox; className: string }> = {
  inquiry: { label: "استفسار عميل", shortLabel: "استفسارات", icon: MessageSquare, className: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  property: { label: "طلب إضافة عقار", shortLabel: "إضافة عقار", icon: ClipboardList, className: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  finishing: { label: "طلب تشطيبات", shortLabel: "تشطيبات", icon: Wrench, className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  ai: { label: "عميل المستشار الذكي", shortLabel: "المستشار الذكي", icon: Sparkles, className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
};

const STATUS_META: Record<RequestStatus, { label: string; className: string }> = {
  new: { label: "جديد", className: "bg-red-500/10 text-red-700 dark:text-red-300" },
  reviewed: { label: "قيد المتابعة", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  replied: { label: "تم التواصل", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
};

const statusValues: RequestStatus[] = ["new", "reviewed", "replied"];
const kindValues: Array<"all" | RequestKind> = ["all", "inquiry", "property", "finishing", "ai"];

function cleanPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "تاريخ غير معروف";
  return date.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
}

function ageInHours(value: string) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return 0;
  return Math.max(0, (Date.now() - time) / 3_600_000);
}

function requestFromInquiry(item: Inquiry): CustomerRequest {
  return {
    id: item.id,
    kind: "inquiry",
    status: item.status,
    name: item.name || "عميل بدون اسم",
    phone: item.phone || "",
    email: item.email || "",
    createdAt: item.createdAt,
    headline: item.subject || "استفسار عام",
    summary: item.message || "لم يكتب العميل تفاصيل إضافية.",
    tags: ["استشارة"],
    details: [
      { label: "الموضوع", value: item.subject || "استفسار عام" },
      { label: "الرسالة", value: item.message || "لا توجد رسالة إضافية." },
    ],
  };
}

function requestFromProperty(item: PropertyRequest, regions: Array<{ id: string; name: string }>, propertyTypes: Array<{ id: string; name: string }>): CustomerRequest {
  const region = regions.find((entry) => entry.id === item.regionId)?.name;
  const propertyType = propertyTypes.find((entry) => entry.id === item.propertyTypeId)?.name;
  return {
    id: item.id,
    kind: "property",
    status: item.status,
    name: item.ownerName || "مالك عقار بدون اسم",
    phone: item.ownerPhone || item.ownerWhatsapp || "",
    email: item.ownerEmail || "",
    createdAt: item.createdAt,
    headline: "رغبة في تسويق عقار",
    summary: item.description || "طلب إضافة عقار جديد إلى المنصة.",
    tags: [region, propertyType, item.listingType, item.area ? `${item.area} م²` : ""].filter(Boolean) as string[],
    details: [
      { label: "المنطقة", value: region || "غير محددة" },
      { label: "نوع العقار", value: propertyType || "غير محدد" },
      { label: "نوع العرض", value: item.listingType || "غير محدد" },
      { label: "المساحة", value: item.area ? `${item.area} م²` : "غير محددة" },
      { label: "السعر المتوقع", value: item.price || "غير محدد" },
      { label: "الوصف", value: item.description || "لا يوجد وصف إضافي." },
      { label: "ملاحظات", value: item.notes || "لا توجد ملاحظات." },
    ],
  };
}

function requestFromFinishing(item: FinishingRequest): CustomerRequest {
  return {
    id: item.id,
    kind: "finishing",
    status: item.status,
    name: item.name || "عميل بدون اسم",
    phone: item.phone || "",
    createdAt: item.createdAt,
    headline: item.finishingType || "طلب تشطيبات",
    summary: item.description || "طلب خدمة تشطيبات عقارية.",
    tags: [item.location, item.area ? `${item.area} م²` : ""].filter(Boolean) as string[],
    details: [
      { label: "نوع التشطيب", value: item.finishingType || "غير محدد" },
      { label: "الموقع", value: item.location || "غير محدد" },
      { label: "المساحة", value: item.area ? `${item.area} م²` : "غير محددة" },
      { label: "التفاصيل", value: item.description || "لا توجد تفاصيل إضافية." },
    ],
  };
}

function requestFromAi(item: AiLead): CustomerRequest {
  return {
    id: item.id,
    kind: "ai",
    status: item.status,
    name: item.name || "عميل من المستشار الذكي",
    phone: item.phone || "",
    createdAt: item.createdAt,
    headline: item.budget ? `ميزانية: ${item.budget}` : "احتياج عقاري",
    summary: item.requirements || "لم يحدد العميل متطلباته بعد.",
    tags: [item.preferredLanguage, item.budget ? `ميزانية ${item.budget}` : ""].filter(Boolean) as string[],
    details: [
      { label: "اللغة المفضلة", value: item.preferredLanguage || "غير محددة" },
      { label: "الميزانية", value: item.budget || "غير محددة" },
      { label: "المتطلبات", value: item.requirements || "لا توجد متطلبات إضافية." },
      { label: "ملاحظات", value: item.notes || "لا توجد ملاحظات." },
    ],
  };
}

export default function CustomerRequests() {
  const {
    inquiries,
    propertyRequests,
    finishingRequests,
    aiLeads,
    regions,
    propertyTypes,
    fetching,
    reload,
    updateInquiryStatus,
    updatePropertyRequestStatus,
    updateFinishingRequestStatus,
    updateAiLeadStatus,
    deleteInquiry,
    deletePropertyRequest,
    deleteFinishingRequest,
    deleteAiLead,
  } = useData();
  const { toast } = useToast();
  const [kind, setKind] = useState<"all" | RequestKind>("all");
  const [status, setStatus] = useState<"all" | RequestStatus>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CustomerRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRequest | null>(null);

  const allRequests = useMemo(() => [
    ...inquiries.map(requestFromInquiry),
    ...propertyRequests.map((item) => requestFromProperty(item, regions, propertyTypes)),
    ...finishingRequests.map(requestFromFinishing),
    ...aiLeads.map(requestFromAi),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [aiLeads, finishingRequests, inquiries, propertyRequests, propertyTypes, regions]);

  const counts = useMemo(() => ({
    all: allRequests.length,
    inquiry: allRequests.filter((item) => item.kind === "inquiry").length,
    property: allRequests.filter((item) => item.kind === "property").length,
    finishing: allRequests.filter((item) => item.kind === "finishing").length,
    ai: allRequests.filter((item) => item.kind === "ai").length,
    new: allRequests.filter((item) => item.status === "new").length,
    reviewed: allRequests.filter((item) => item.status === "reviewed").length,
    replied: allRequests.filter((item) => item.status === "replied").length,
  }), [allRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    return allRequests.filter((item) => {
      const matchesKind = kind === "all" || item.kind === kind;
      const matchesStatus = status === "all" || item.status === status;
      const haystack = [item.name, item.phone, item.email, item.headline, item.summary, ...item.tags].join(" ").toLocaleLowerCase("ar");
      return matchesKind && matchesStatus && (!query || haystack.includes(query));
    });
  }, [allRequests, kind, search, status]);

  const averageAge = allRequests.length
    ? Math.round(allRequests.reduce((total, item) => total + ageInHours(item.createdAt), 0) / allRequests.length)
    : 0;

  const updateStatus = (item: CustomerRequest, nextStatus: RequestStatus) => {
    if (item.kind === "inquiry") updateInquiryStatus(item.id, nextStatus);
    if (item.kind === "property") updatePropertyRequestStatus(item.id, nextStatus);
    if (item.kind === "finishing") updateFinishingRequestStatus(item.id, nextStatus);
    if (item.kind === "ai") updateAiLeadStatus(item.id, nextStatus);
    setSelected((current) => current?.id === item.id && current.kind === item.kind ? { ...current, status: nextStatus } : current);
    toast({ title: "تم تحديث حالة الطلب", description: STATUS_META[nextStatus].label });
  };

  const deleteRequest = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "inquiry") deleteInquiry(deleteTarget.id);
    if (deleteTarget.kind === "property") deletePropertyRequest(deleteTarget.id);
    if (deleteTarget.kind === "finishing") deleteFinishingRequest(deleteTarget.id);
    if (deleteTarget.kind === "ai") deleteAiLead(deleteTarget.id);
    if (selected?.id === deleteTarget.id && selected.kind === deleteTarget.kind) setSelected(null);
    setDeleteTarget(null);
    toast({ title: "تم حذف الطلب" });
  };

  const clearFilters = () => {
    setKind("all");
    setStatus("all");
    setSearch("");
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6" dir="rtl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-accent">
              <Inbox className="h-4 w-4" />
              <span>مركز المتابعة</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">طلبات العملاء</h1>
            <p className="mt-1 text-sm text-muted-foreground">كل الطلبات الواردة في مساحة واحدة، مرتبة بالأحدث لتسهيل المتابعة اليومية.</p>
          </div>
          <Button variant="outline" className="gap-2 self-start sm:self-auto" onClick={() => void reload()} disabled={fetching}>
            <RefreshCw className={fetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            تحديث البيانات
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "إجمالي الطلبات", value: counts.all, icon: Inbox, className: "text-accent" },
            { label: "طلبات جديدة", value: counts.new, icon: Clock3, className: "text-red-600" },
            { label: "قيد المتابعة", value: counts.reviewed, icon: RefreshCw, className: "text-amber-600" },
            { label: "متوسط عمر الطلب", value: averageAge ? `${averageAge} ساعة` : "—", icon: CalendarDays, className: "text-sky-600" },
          ].map((stat) => (
            <Card key={stat.label} className="card-luxury">
              <CardContent className="flex items-center justify-between p-4 sm:p-5">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.className}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="card-luxury overflow-hidden">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {kindValues.map((value) => {
                const active = kind === value;
                const label = value === "all" ? "كل الطلبات" : KIND_META[value].shortLabel;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setKind(value)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground hover:border-accent/50 hover:text-foreground"}`}
                  >
                    {label}
                    <span className={`mr-1.5 text-xs ${active ? "text-accent-foreground/80" : "text-muted-foreground"}`}>
                      {counts[value]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم أو الهاتف أو الموضوع..." className="pr-9" />
              </div>
              <Select value={status} onValueChange={(value: "all" | RequestStatus) => setStatus(value)}>
                <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="كل الحالات" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  {statusValues.map((value) => <SelectItem key={value} value={value}>{STATUS_META[value].label}</SelectItem>)}
                </SelectContent>
              </Select>
              {(search || kind !== "all" || status !== "all") && (
                <Button variant="ghost" onClick={clearFilters}>مسح الفلاتر</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">الوارد الأخير</h2>
            <p className="mt-1 text-xs text-muted-foreground">{filteredRequests.length} طلب مطابق للعرض الحالي</p>
          </div>
          <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
            {statusValues.map((value) => <span key={value} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${value === "new" ? "bg-red-500" : value === "reviewed" ? "bg-amber-500" : "bg-emerald-500"}`} />{STATUS_META[value].label}: {counts[value]}</span>)}
          </div>
        </div>

        {fetching && allRequests.length === 0 ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-7 w-7" />}
            title={allRequests.length === 0 ? "لا توجد طلبات عملاء حتى الآن" : "لا توجد نتائج مطابقة"}
            description={allRequests.length === 0 ? "ستظهر هنا الاستفسارات وطلبات الخدمات الواردة من زوار المنصة." : "جرّب تعديل كلمات البحث أو مسح الفلاتر لعرض كل الطلبات."}
            action={allRequests.length === 0 ? { label: "تحديث البيانات", onClick: () => void reload() } : { label: "مسح الفلاتر", onClick: clearFilters }}
            className="py-16"
          />
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((item) => {
              const kindMeta = KIND_META[item.kind];
              const statusMeta = STATUS_META[item.status];
              const Icon = kindMeta.icon;
              const phone = cleanPhone(item.phone);
              return (
                <Card key={`${item.kind}-${item.id}`} className={`card-luxury overflow-hidden border-r-4 ${item.status === "new" ? "border-r-accent" : "border-r-transparent"}`}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kindMeta.className}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge className={`border-none text-[11px] ${kindMeta.className}`}>{kindMeta.label}</Badge>
                            <Badge className={`border-none text-[11px] ${statusMeta.className}`}>{statusMeta.label}</Badge>
                            {item.status === "new" && ageInHours(item.createdAt) > 24 && <Badge variant="outline" className="border-red-500/30 text-[11px] text-red-600">يحتاج متابعة</Badge>}
                          </div>
                          <h3 className="truncate text-base font-bold text-foreground">{item.name}</h3>
                          <p className="mt-1 text-sm font-medium text-accent">{item.headline}</p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                          {item.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{item.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">{tag}</span>)}</div>}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 lg:w-72 lg:flex-col lg:items-stretch lg:border-t-0 lg:border-r lg:pt-0 lg:pr-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        {phone && (
                          <div className="flex flex-wrap gap-2">
                            <a href={`tel:${phone}`} dir="ltr" className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent">
                              <Phone className="h-3.5 w-3.5" />اتصال
                            </a>
                            <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 px-2.5 py-1.5 text-xs text-emerald-600 transition-colors hover:bg-emerald-500/10">
                              <WhatsAppIcon className="h-3.5 w-3.5" />واتساب
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Select value={item.status} onValueChange={(value: RequestStatus) => updateStatus(item, value)}>
                            <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{statusValues.map((value) => <SelectItem key={value} value={value}>{STATUS_META[value].label}</SelectItem>)}</SelectContent>
                          </Select>
                          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelected(item)} title="عرض التفاصيل">
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(item)} title="حذف الطلب">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg" dir="rtl">
          {selected && (
            <>
              <SheetHeader className="text-right">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className={`border-none ${KIND_META[selected.kind].className}`}>{KIND_META[selected.kind].label}</Badge>
                  <Badge className={`border-none ${STATUS_META[selected.status].className}`}>{STATUS_META[selected.status].label}</Badge>
                </div>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.headline} · {formatDate(selected.createdAt)}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 py-6">
                <div className="grid grid-cols-2 gap-2">
                  {selected.phone && <a href={`tel:${cleanPhone(selected.phone)}`} className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground"><Phone className="h-4 w-4" />اتصال</a>}
                  {selected.email && <a href={`mailto:${selected.email}`} className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground"><Mail className="h-4 w-4" />بريد إلكتروني</a>}
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">ملخص الطلب</p>
                  <p className="text-sm leading-7 text-foreground">{selected.summary}</p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">تفاصيل الطلب</h3>
                  {selected.details.map((detail) => (
                    <div key={detail.label} className="border-b border-border/60 pb-3 last:border-0">
                      <p className="text-xs text-muted-foreground">{detail.label}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">{detail.value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">تحديث حالة الطلب</p>
                  <Select value={selected.status} onValueChange={(value: RequestStatus) => updateStatus(selected, value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{statusValues.map((value) => <SelectItem key={value} value={value}>{STATUS_META[value].label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(selected)}>
                  <Trash2 className="h-4 w-4" /> حذف الطلب
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف طلب العميل؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف طلب {deleteTarget?.name || "العميل"} نهائيًا من قائمة الطلبات. لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteRequest}>حذف نهائي</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}