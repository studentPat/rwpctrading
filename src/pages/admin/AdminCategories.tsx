import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories", search],
    queryFn: async () => {
      let q = supabase.from("categories").select("*").order("created_at", { ascending: false });
      if (search) q = q.ilike("name", `%${search}%`);
      const { data } = await q;
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingCategory) {
        const { error } = await supabase.from("categories").update({ name: form.name, description: form.description }).eq("id", editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert({ name: form.name, description: form.description });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(editingCategory ? "Category updated" : "Category created");
      setOpen(false);
      setForm({ name: "", description: "" });
      setEditingCategory(null);
    },
    onError: () => toast.error("Failed to save category"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("categories").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, description: cat.description || "" });
    setOpen(true);
  };

  const openNew = () => {
    setEditingCategory(null);
    setForm({ name: "", description: "" });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Categories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
              className="space-y-4"
            >
              <Input placeholder="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-sm" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : categories && categories.length > 0 ? categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.description || "—"}</TableCell>
                <TableCell>
                  <Switch checked={c.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: c.id, is_active: v })} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No categories yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
