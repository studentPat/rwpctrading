import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Archive, Search } from "lucide-react";
import { toast } from "sonner";
import StockBadge from "@/components/StockBadge";

interface ProductForm {
  name: string;
  category_id: string;
  brand: string;
  model: string;
  description: string;
  price: string;
  show_price: boolean;
  warranty: string;
  stock_status: string;
}

const emptyForm: ProductForm = {
  name: "", category_id: "", brand: "", model: "", description: "",
  price: "", show_price: false, warranty: "", stock_status: "Available",
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const { data: categories } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data ?? [];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: async () => {
      let q = supabase.from("products").select("*, categories(name)").eq("is_archived", false);
      if (search) q = q.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
      const { data } = await q.order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        category_id: form.category_id || null,
        brand: form.brand || null,
        model: form.model || null,
        description: form.description || null,
        price: form.price ? parseFloat(form.price) : null,
        show_price: form.show_price,
        warranty: form.warranty || null,
        stock_status: form.stock_status,
      };
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editing ? "Product updated" : "Product created");
      setOpen(false);
      setForm(emptyForm);
      setEditing(null);
    },
    onError: () => toast.error("Failed to save product"),
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").update({ is_archived: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product archived");
    },
  });

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      category_id: p.category_id || "",
      brand: p.brand || "",
      model: p.model || "",
      description: p.description || "",
      price: p.price?.toString() || "",
      show_price: p.show_price,
      warranty: p.warranty || "",
      stock_status: p.stock_status,
    });
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <Input placeholder="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                <Input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <div className="flex items-center gap-2">
                  <Switch checked={form.show_price} onCheckedChange={(v) => setForm({ ...form, show_price: v })} />
                  <span className="text-sm">Show price</span>
                </div>
              </div>
              <Input placeholder="Warranty" value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} />
              <Select value={form.stock_status} onValueChange={(v) => setForm({ ...form, stock_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Limited Stock">Limited Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">
                {saveMutation.isPending ? "Saving..." : "Save Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-sm" />
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : products && products.length > 0 ? products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-sm">{p.brand || "—"}</TableCell>
                <TableCell className="text-sm">{(p.categories as any)?.name || "—"}</TableCell>
                <TableCell><StockBadge status={p.stock_status} /></TableCell>
                <TableCell className="text-sm">{p.stock_quantity}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => archiveMutation.mutate(p.id)}>
                      <Archive className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
