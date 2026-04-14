import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminFeedback() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: feedback, isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const toggleApproved = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const { error } = await supabase.from("feedback").update({ is_approved, is_displayed: is_approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feedback").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast.success("Feedback deleted");
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Feedback</h1>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : feedback && feedback.length > 0 ? feedback.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell className="text-sm">{f.email || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs">
                  <div
                    className={expandedId === f.id ? "whitespace-pre-wrap" : "line-clamp-2 cursor-pointer"}
                    onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                    title="Click to expand"
                  >
                    {f.message}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Switch checked={f.is_approved} onCheckedChange={(v) => toggleApproved.mutate({ id: f.id, is_approved: v })} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(f.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No feedback yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
