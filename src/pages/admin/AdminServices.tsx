import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Wrench, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ServiceForm {
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const emptyForm: ServiceForm = {
  title: "",
  description: "",
  icon: "",
  sort_order: 0,
  is_active: true,
};

export default function AdminServices() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const uploadIcon = async (serviceId: string, file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `services/${serviceId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      setUploading(true);
      if (editId) {
        let iconUrl = data.icon;
        if (iconFile) {
          iconUrl = await uploadIcon(editId, iconFile);
        }
        const { error } = await supabase.from("services").update({ ...data, icon: iconUrl }).eq("id", editId);
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase.from("services").insert({ ...data, icon: data.icon || "Wrench" }).select().single();
        if (error) throw error;
        if (iconFile && created) {
          const iconUrl = await uploadIcon(created.id, iconFile);
          await supabase.from("services").update({ icon: iconUrl }).eq("id", created.id);
        }
      }
      setUploading(false);
    },
    onSuccess: () => {
      toast.success(editId ? "Service updated" : "Service created");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setOpen(false);
      resetForm();
    },
    onError: (e: any) => {
      setUploading(false);
      toast.error(e.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setIconFile(null);
  };

  const openEdit = (s: any) => {
    setEditId(s.id);
    setForm({
      title: s.title,
      description: s.description || "",
      icon: s.icon || "",
      sort_order: s.sort_order || 0,
      is_active: s.is_active,
    });
    setIconFile(null);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    saveMutation.mutate(form);
  };

  const isIconUrl = (icon: string) => icon.startsWith("http");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">Manage your services offerings</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Service</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editId ? "Edit" : "Add"} Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Icon Image</Label>
                <div className="flex items-center gap-3 mt-1">
                  {(iconFile || (form.icon && isIconUrl(form.icon))) && (
                    <div className="relative w-14 h-14 rounded border overflow-hidden group">
                      <img
                        src={iconFile ? URL.createObjectURL(iconFile) : form.icon}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIconFile(null);
                          setForm({ ...form, icon: "" });
                        }}
                        className="absolute top-0 right-0 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setIconFile(e.target.files[0]);
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" /> Upload Icon
                  </Button>
                </div>
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <Button type="submit" disabled={saveMutation.isPending || uploading} className="w-full">
                {uploading ? "Uploading..." : saveMutation.isPending ? "Saving..." : editId ? "Update Service" : "Create Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Icon</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : services && services.length > 0 ? (
              services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    {s.icon && isIconUrl(s.icon) ? (
                      <img src={s.icon} alt="" className="w-10 h-10 rounded object-contain" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-accent flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{s.sort_order}</TableCell>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>
                    <Badge variant={s.is_active ? "default" : "secondary"}>
                      {s.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this service?")) deleteMutation.mutate(s.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Wrench className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-muted-foreground">No services yet</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
