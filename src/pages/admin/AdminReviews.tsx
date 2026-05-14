import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Star, Trash2, Upload, X, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", rating: "5", comment: "", image_url: "" });
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("reviews").update({
          name: form.name, rating: parseInt(form.rating), comment: form.comment, image_url: form.image_url || null,
        }).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reviews").insert({
          name: form.name, rating: parseInt(form.rating), comment: form.comment, image_url: form.image_url || null, is_approved: true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success(editingId ? "Review updated" : "Review added");
      setOpen(false);
      setEditingId(null);
      setForm({ name: "", rating: "5", comment: "", image_url: "" });
    },
    onError: () => toast.error("Failed to save review"),
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("review-images").upload(path, file);
    if (error) {
      toast.error("Upload failed");
    } else {
      const { data } = supabase.storage.from("review-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
    }
    setUploading(false);
  };

  const openEdit = (r: any) => {
    setEditingId(r.id);
    setForm({ name: r.name, rating: String(r.rating), comment: r.comment || "", image_url: r.image_url || "" });
    setOpen(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", rating: "5", comment: "", image_url: "" });
    setOpen(true);
  };

  const toggleApproval = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const { error } = await supabase.from("reviews").update({ is_approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review deleted");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Reviews</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Review</Button>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Review" : "Add Review"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
              <Input placeholder="Customer Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={n.toString()}>{n} Star{n > 1 ? "s" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Comment" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
              <div className="space-y-2">
                <label className="text-sm font-medium">Proof Image (optional)</label>
                {form.image_url ? (
                  <div className="relative inline-block">
                    <img src={form.image_url} alt="proof" className="h-32 w-32 object-cover rounded-md border" />
                    <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-muted/50 transition">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">{uploading ? "Uploading..." : "Upload image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  </label>
                )}
              </div>
              <Button type="submit" disabled={addMutation.isPending || uploading} className="w-full">
                {editingId ? "Save Changes" : "Add Review"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : reviews && reviews.length > 0 ? reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name} className="h-10 w-10 object-cover rounded-md border" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs">
                  <div
                    className={expandedId === r.id ? "whitespace-pre-wrap" : "line-clamp-2 cursor-pointer"}
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    title="Click to expand"
                  >
                    {r.comment || "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch checked={r.is_approved} onCheckedChange={(v) => toggleApproval.mutate({ id: r.id, is_approved: v })} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No reviews yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
