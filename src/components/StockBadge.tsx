import { Badge } from "@/components/ui/badge";

export default function StockBadge({ status }: { status: string }) {
  const variant = status === "Available"
    ? "default"
    : status === "Limited Stock"
    ? "secondary"
    : "destructive";

  return <Badge variant={variant}>{status}</Badge>;
}
