import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Users as UsersIcon, Pencil, Trash2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData, User } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const roleLabels = { admin: "مدير النظام", agent: "مستشار عقاري", customer: "عميل" };

export default function Users() {
  const { users, addUser, updateUser, deleteUser, toggleUser } = useData();
  const { currentUser, refreshCurrentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    role: "customer" as any,
    password: "",
    canClearActivityLogs: false,
  });

  const isStaffRole = form.role === "admin" || form.role === "agent";

  const filteredUsers = users.filter(u => 
    !search || 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.email) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم والبريد الإلكتروني", variant: "destructive" });
      return;
    }
    if (isStaffRole && (!form.username || !form.password)) {
      toast({ title: "خطأ", description: "حسابات الإدارة والموظفين تتطلب اسم مستخدم وكلمة مرور", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const saved = await addUser({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        username: isStaffRole ? form.username.trim() : undefined,
        password: isStaffRole ? form.password : undefined,
        canClearActivityLogs: form.role === "agent" ? form.canClearActivityLogs : false,
        active: true,
      });
      if (!saved) return;
      setShowAddDialog(false);
      toast({ title: "تم بنجاح", description: "تمت إضافة المستخدم وحفظه على الخادم" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget || !form.name || !form.email) return;
    if (isStaffRole && !form.username) {
      toast({ title: "خطأ", description: "حسابات الإدارة والموظفين تتطلب اسم مستخدم", variant: "destructive" });
      return;
    }
    const saved = await updateUser(editTarget.id, {
      name: form.name,
      email: form.email,
      role: form.role,
      username: isStaffRole ? form.username.trim() : undefined,
      canClearActivityLogs: form.role === "agent" ? form.canClearActivityLogs : false,
      ...(form.password ? { password: form.password } : {}),
    });
    if (saved && editTarget.id === currentUser?.id) {
      await refreshCurrentUser();
    }
    setEditTarget(null);
    toast({ title: "تم بنجاح", description: "تم تحديث بيانات المستخدم" });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === currentUser?.id) {
      toast({
        title: "لا يمكن حذف حسابك",
        description: "اترك حسابك الإداري موجودًا حتى لا تفقد الوصول إلى المنصة.",
        variant: "destructive",
      });
      return;
    }
    deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: "تم بنجاح", description: "تم حذف المستخدم بنجاح" });
  };

  const handleToggle = (id: string) => {
    if (id === currentUser?.id) {
      toast({
        title: "لا يمكن تعطيل حسابك",
        description: "اترك حسابك الإداري نشطًا حتى لا تفقد الوصول إلى المنصة.",
        variant: "destructive",
      });
      return;
    }
    toggleUser(id);
    toast({ title: "تم بنجاح", description: "تم تحديث حالة المستخدم" });
  };

  const openAdd = () => {
    setForm({ name: "", email: "", username: "", role: "customer", password: "", canClearActivityLogs: false });
    setShowAddDialog(true);
  };

  const openEdit = (u: User) => {
    setForm({
      name: u.name,
      email: u.email,
      username: u.username || "",
      role: u.role,
      password: "",
      canClearActivityLogs: u.canClearActivityLogs ?? false,
    });
    setEditTarget(u);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="إدارة المستخدمين"
          subtitle="عرض وإدارة حسابات المستخدمين وصلاحياتهم"
          eyebrow="فريق العمل والوصول"
          icon={UsersIcon}
          actions={
            <Button className="h-10 gap-2 bg-[#B99A68] text-[#10202D] hover:bg-[#C9AB78]" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              مستخدم جديد
            </Button>
          }
        />

        <div className="relative max-w-md">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث بالاسم أو البريد الإلكتروني..." 
            className="pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الانضمام</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{roleLabels[user.role]}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}>
                      {user.active ? "نشط" : "غير نشط"}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.joinedAt).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={user.id === currentUser?.id}
                        title={user.id === currentUser?.id ? "لا يمكن تعطيل حسابك أثناء تسجيل الدخول" : user.active ? "تعطيل الحساب" : "تفعيل الحساب"}
                        onClick={() => handleToggle(user.id)}
                      >
                        {user.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={user.id === currentUser?.id}
                        title={user.id === currentUser?.id ? "لا يمكن حذف حسابك أثناء تسجيل الدخول" : "حذف الحساب"}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState 
                      icon={<UsersIcon className="h-8 w-8" />}
                      title="لا يوجد مستخدمين"
                      description="لم يتم العثور على أي مستخدمين مسجلين في المنصة."
                      className="border-none py-12 rounded-none"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>الدور</Label>
                <Select
                  value={form.role}
                  disabled={editTarget?.id === currentUser?.id}
                  onValueChange={(val: any) => setForm({ ...form, role: val })}
                >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير النظام</SelectItem>
                  <SelectItem value="agent">مستشار عقاري</SelectItem>
                  <SelectItem value="customer">عميل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isStaffRole && (
              <>
                <p className="text-xs text-muted-foreground">بيانات الدخول للوحة التحكم (للإدارة والموظفين فقط)</p>
                <div className="space-y-2">
                  <Label>اسم المستخدم</Label>
                  <Input dir="ltr" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور</Label>
                  <Input type="password" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                {isAdmin && form.role === "agent" && (
                  <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3">
                    <Checkbox
                      id="new-user-clear-activity-logs"
                      checked={form.canClearActivityLogs}
                      onCheckedChange={(checked) => setForm({ ...form, canClearActivityLogs: checked === true })}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="new-user-clear-activity-logs" className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        السماح بتصفير سجلات النشاط
                      </Label>
                      <p className="text-xs leading-5 text-muted-foreground">صلاحية حساسة تمنح الموظف حذف سجل النشاط بالكامل بعد التأكيد.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? "جارٍ الحفظ..." : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>الدور</Label>
              <Select value={form.role} onValueChange={(val: any) => setForm({ ...form, role: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير النظام</SelectItem>
                  <SelectItem value="agent">مستشار عقاري</SelectItem>
                  <SelectItem value="customer">عميل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isStaffRole && (
              <>
                <p className="text-xs text-muted-foreground">بيانات الدخول للوحة التحكم (للإدارة والموظفين فقط)</p>
                <div className="space-y-2">
                  <Label>اسم المستخدم</Label>
                  <Input dir="ltr" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>كلمة مرور جديدة <span className="text-muted-foreground font-normal">(اتركها فارغة للإبقاء على الحالية)</span></Label>
                  <Input type="password" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                {isAdmin && form.role === "agent" && (
                  <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3">
                    <Checkbox
                      id="edit-user-clear-activity-logs"
                      checked={form.canClearActivityLogs}
                      onCheckedChange={(checked) => setForm({ ...form, canClearActivityLogs: checked === true })}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="edit-user-clear-activity-logs" className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        السماح بتصفير سجلات النشاط
                      </Label>
                      <p className="text-xs leading-5 text-muted-foreground">صلاحية حساسة تمنح الموظف حذف سجل النشاط بالكامل بعد التأكيد.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>إلغاء</Button>
            <Button onClick={handleEdit}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المستخدم نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
