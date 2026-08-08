import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, Plus, X, Download, Edit2, Trash2, Search, BookUser, MapPin, FileText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function Sources() {
  const { properties, propertyTypes, regions, updateProperty } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    source: string;
    sourcePhones: string[];
    sourceEmail: string;
    sourceLocation: string;
    sourceNotes: string;
  }>({ source: "", sourcePhones: [""], sourceEmail: "", sourceLocation: "", sourceNotes: "" });

  const sourcedProps = useMemo(() =>
    properties.filter(p =>
      p.source?.trim() ||
      p.sourcePhones?.some(ph => ph.trim()) ||
      p.sourceEmail?.trim() ||
      p.sourceLocation?.trim() ||
      p.sourceNotes?.trim()
    ),
    [properties]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sourcedProps;
    return sourcedProps.filter(p =>
      p.code?.toLowerCase().includes(q) ||
      p.source?.toLowerCase().includes(q) ||
      p.sourceEmail?.toLowerCase().includes(q) ||
      p.sourceNotes?.toLowerCase().includes(q) ||
      p.sourcePhones?.some(ph => ph.includes(q))
    );
  }, [sourcedProps, search]);

  const openEdit = (id: string) => {
    const p = properties.find(x => x.id === id);
    if (!p) return;
    setEditForm({
      source: p.source ?? "",
      sourcePhones: p.sourcePhones?.length ? [...p.sourcePhones] : [""],
      sourceEmail: p.sourceEmail ?? "",
      sourceLocation: p.sourceLocation ?? "",
      sourceNotes: p.sourceNotes ?? "",
    });
    setEditTarget(id);
  };

  const saveEdit = () => {
    if (!editTarget) return;
    updateProperty(editTarget, {
      source: editForm.source,
      sourcePhones: editForm.sourcePhones.filter(ph => ph.trim()),
      sourceEmail: editForm.sourceEmail,
      sourceLocation: editForm.sourceLocation,
      sourceNotes: editForm.sourceNotes,
    });
    toast({ title: "تم حفظ بيانات المصدر ✓" });
    setEditTarget(null);
  };

  const clearSource = (id: string) => {
    updateProperty(id, { source: "", sourcePhones: [], sourceEmail: "", sourceLocation: "", sourceNotes: "" });
    toast({ title: "تم مسح بيانات المصدر" });
  };

  const exportCSV = () => {
    const rows = [["كود العقار", "المصدر", "أرقام التواصل", "البريد الإلكتروني", "رابط الموقع", "ملاحظات", "نوع العقار", "المنطقة"]];
    sourcedProps.forEach(p => {
      const type = propertyTypes.find(t => t.id === p.typeId)?.name ?? "";
      const region = regions.find(r => r.id === p.regionId)?.name ?? "";
      rows.push([
        p.code,
        p.source ?? "",
        (p.sourcePhones ?? []).filter(ph => ph.trim()).join(" / "),
        p.sourceEmail ?? "",
        p.sourceLocation ?? "",
        p.sourceNotes ?? "",
        type,
        region,
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `مصادر-العقارات-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addPhone = () => setEditForm(f => ({ ...f, sourcePhones: [...f.sourcePhones, ""] }));
  const removePhone = (i: number) => setEditForm(f => ({ ...f, sourcePhones: f.sourcePhones.filter((_, idx) => idx !== i) }));
  const setPhone = (i: number, v: string) => setEditForm(f => ({ ...f, sourcePhones: f.sourcePhones.map((p, idx) => idx === i ? v : p) }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6" dir="rtl">
        <AdminPageHeader
          title="مصادر العقارات"
          subtitle="بيانات التواصل مع الملاك والسماسرة — خاصة بالإدارة فقط"
          eyebrow="دليل المصادر"
          icon={BookUser}
          actions={
            <Button
              variant="outline"
              className="h-10 gap-2 border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 hover:text-white"
              onClick={exportCSV}
            >
              <Download className="h-4 w-4" />
              تصدير CSV
            </Button>
          }
        />

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><span className="font-semibold text-foreground">{sourcedProps.length}</span> مصدر مسجّل</span>
          {search && <span>— <span className="font-semibold text-foreground">{filtered.length}</span> نتيجة</span>}
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pr-9"
            placeholder="ابحث بالكود أو اسم المصدر أو رقم الهاتف أو البريد أو الملاحظات..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookUser className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-base font-medium">{search ? "لا توجد نتائج مطابقة" : "لا توجد مصادر مسجّلة حتى الآن"}</p>
            {!search && <p className="text-xs mt-1">أضف بيانات التواصل عند إدخال أي عقار من صفحة العقارات</p>}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-right">
                    <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">الكود</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">المصدر</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">أرقام التواصل</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">البريد</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">الموقع</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">ملاحظات</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(p => {
                    const phones = (p.sourcePhones ?? []).filter(ph => ph.trim());
                    return (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-accent">{p.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          {p.source?.trim()
                            ? <span className="font-medium">{p.source}</span>
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {phones.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {phones.map((ph, i) => (
                                <a key={i} href={`tel:${ph.replace(/\s/g, "")}`}
                                  className="flex items-center gap-1.5 text-accent hover:underline" dir="ltr">
                                  <Phone className="h-3 w-3 flex-shrink-0" />{ph}
                                </a>
                              ))}
                            </div>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {p.sourceEmail?.trim() ? (
                            <a href={`mailto:${p.sourceEmail}`}
                              className="flex items-center gap-1.5 text-accent hover:underline" dir="ltr">
                              <Mail className="h-3 w-3 flex-shrink-0" />{p.sourceEmail}
                            </a>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {p.sourceLocation?.trim() ? (
                            <a href={p.sourceLocation} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-accent hover:underline text-xs">
                              <MapPin className="h-3 w-3 flex-shrink-0" />الموقع
                            </a>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          {p.sourceNotes?.trim() ? (
                            <p className="text-xs text-muted-foreground line-clamp-2">{p.sourceNotes}</p>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(p.id)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors" title="تعديل">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => clearSource(p.id)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="مسح البيانات">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!editTarget} onOpenChange={v => { if (!v) setEditTarget(null); }}>
        <DialogContent dir="rtl" className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookUser className="h-5 w-5 text-accent" />
              تعديل بيانات المصدر
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">اسم المصدر</Label>
              <Input placeholder="مثال: أحمد السيد / بروكر / مالك مباشر..."
                value={editForm.source} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />أرقام التواصل</Label>
              <div className="space-y-2">
                {editForm.sourcePhones.map((ph, i) => (
                  <div key={i} className="flex gap-2">
                    <Input dir="ltr" className="flex-1 text-right" placeholder="+20 10 0000 0000"
                      value={ph} onChange={e => setPhone(i, e.target.value)} />
                    {editForm.sourcePhones.length > 1 && (
                      <button type="button" onClick={() => removePhone(i)}
                        className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors flex-shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {editForm.sourcePhones.length < 5 && (
                  <button type="button" onClick={addPhone}
                    className="w-full flex items-center justify-center gap-1.5 h-9 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-accent hover:border-accent transition-colors">
                    <Plus className="h-4 w-4" />أضف رقم
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />البريد الإلكتروني</Label>
              <Input dir="ltr" className="text-right" type="email" placeholder="example@mail.com"
                value={editForm.sourceEmail} onChange={e => setEditForm(f => ({ ...f, sourceEmail: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />رابط الموقع</Label>
              <Input dir="ltr" className="text-right text-xs" placeholder="https://maps.google.com/..."
                value={editForm.sourceLocation} onChange={e => setEditForm(f => ({ ...f, sourceLocation: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />ملاحظات</Label>
              <Textarea rows={3} placeholder="تفاصيل إضافية عن المصدر..."
                value={editForm.sourceNotes} onChange={e => setEditForm(f => ({ ...f, sourceNotes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>إلغاء</Button>
            <Button className="bg-accent text-white hover:bg-accent/90" onClick={saveEdit}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
