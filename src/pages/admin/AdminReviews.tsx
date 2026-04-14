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
import { Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", rating: "5", comment: "" });
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
      const { error } = await supabase.from("reviews").insert({
        name: form.name, rating: parseInt(form.rating), comment: form.comment, is_approved: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review added");
      setOpen(false);
      setForm({ name: "", rating: "5", comment: "" });
    },
    onError: () => toast.error("Failed to add review"),
  });

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
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Review</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
              <Input placeholder="Customer Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={n.toString()}>{n} Star{n > 1 ? "s" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Comment" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
              <Button type="submit" disabled={addMutation.isPending} className="w-full">Add Review</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : reviews && reviews.length > 0 ? reviews.map((r) => (
              <TableRow key={r.id}>
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
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No reviews yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
