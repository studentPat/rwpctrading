import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Send, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ReviewsPage() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      name,
      rating: parseInt(rating),
      comment: comment || null,
      is_approved: false,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted! It will appear once approved.");
      setName("");
      setRating("5");
      setComment("");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMC0yIDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Customer Reviews</h1>
          <p className="opacity-80">Hear from our satisfied customers</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Reviews list */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((r) => (
                  <Card
                    key={r.id}
                    className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-video w-full bg-muted overflow-hidden flex items-center justify-center">
                      {r.image_url ? (
                        <img
                          src={r.image_url}
                          alt={`Review by ${r.name}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ImageIcon className="h-10 w-10 opacity-40" />
                          <span className="text-xs">No image provided</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-5 w-5 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                        ))}
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground mb-4">"{r.comment}"</p>}
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">— {r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Star className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews yet. Be the first to leave one!</p>
              </div>
            )}
          </div>

          {/* Leave a Review form */}
          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="font-display font-bold text-lg mb-4">Leave a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="rev-name">Name *</Label>
                  <Input id="rev-name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>Rating</Label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {"★".repeat(n)}{"☆".repeat(5 - n)} ({n})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rev-comment">Comment</Label>
                  <Textarea id="rev-comment" placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">Your review will be visible after admin approval.</p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
