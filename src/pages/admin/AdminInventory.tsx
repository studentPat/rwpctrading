import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import StockBadge from "@/components/StockBadge";

export default function AdminInventory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("qty-asc");

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-inventory", search, statusFilter, sortBy],
    queryFn: async () => {
      let q = supabase.from("products").select("id, name, brand, stock_quantity, stock_status").eq("is_archived", false);
      if (search) q = q.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
      if (statusFilter !== "all") q = q.eq("stock_status", statusFilter);
      const sortMap: Record<string, { col: string; asc: boolean }> = {
        "qty-asc": { col: "stock_quantity", asc: true },
        "qty-desc": { col: "stock_quantity", asc: false },
        "name-asc": { col: "name", asc: true },
        "name-desc": { col: "name", asc: false },
        "brand-asc": { col: "brand", asc: true },
      };
      const s = sortMap[sortBy] ?? sortMap["qty-asc"];
      const { data } = await q.order(s.col, { ascending: s.asc });
      return data ?? [];
    },
  });

  const stockMutation = useMutation({
    mutationFn: async ({ productId, type, qty }: { productId: string; type: "stock_in" | "stock_out"; qty: number }) => {
      const product = products?.find((p) => p.id === productId);
      if (!product) throw new Error("Product not found");
      const newQty = type === "stock_in" ? product.stock_quantity + qty : product.stock_quantity - qty;
      if (newQty < 0) throw new Error("Cannot go below 0");
      const newStatus = newQty === 0 ? "Out of Stock" : newQty <= 5 ? "Limited Stock" : "Available";

      const { error: logError } = await supabase.from("inventory_logs").insert({
        product_id: productId, change_type: type, quantity: qty, created_by: user?.id,
      });
      if (logError) throw logError;

      const { error } = await supabase.from("products").update({ stock_quantity: newQty, stock_status: newStatus }).eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      toast.success("Stock updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleStock = (productId: string, type: "stock_in" | "stock_out") => {
    const qty = parseInt(quantities[productId] || "0");
    if (qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    stockMutation.mutate({ productId, type, qty });
    setQuantities((prev) => ({ ...prev, [productId]: "" }));
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Inventory Management</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Limited Stock">Limited Stock</SelectItem>
            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="qty-asc">Quantity (Low → High)</SelectItem>
            <SelectItem value="qty-desc">Quantity (High → Low)</SelectItem>
            <SelectItem value="name-asc">Name (A → Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z → A)</SelectItem>
            <SelectItem value="brand-asc">Brand (A → Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Adjust Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : products && products.length > 0 ? products.map((p) => (
              <TableRow key={p.id} className={p.stock_quantity === 0 ? "bg-destructive/5" : p.stock_quantity <= 5 ? "bg-warning/5" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {p.stock_quantity <= 5 && p.stock_quantity > 0 && <AlertTriangle className="h-4 w-4 text-warning" />}
                    {p.name}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{p.brand || "—"}</TableCell>
                <TableCell className="font-mono font-bold">{p.stock_quantity}</TableCell>
                <TableCell><StockBadge status={p.stock_status} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={quantities[p.id] || ""}
                      onChange={(e) => setQuantities((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-20"
                    />
                    <Button size="sm" variant="outline" onClick={() => handleStock(p.id, "stock_in")} disabled={stockMutation.isPending}>
                      <Plus className="h-3 w-3 mr-1" /> In
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStock(p.id, "stock_out")} disabled={stockMutation.isPending}>
                      <Minus className="h-3 w-3 mr-1" /> Out
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No products.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
