import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderOpen, AlertTriangle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, categories, lowStock, outOfStock] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_archived", false),
        supabase.from("categories").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_archived", false).eq("stock_status", "Limited Stock"),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_archived", false).eq("stock_status", "Out of Stock"),
      ]);
      return {
        totalProducts: products.count ?? 0,
        totalCategories: categories.count ?? 0,
        lowStock: lowStock.count ?? 0,
        outOfStock: outOfStock.count ?? 0,
      };
    },
  });

  const { data: recentProducts } = useQuery({
    queryKey: ["recent-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, stock_status, created_at")
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Total Products", value: stats?.totalProducts ?? 0, icon: Package, color: "text-primary" },
    { label: "Categories", value: stats?.totalCategories ?? 0, icon: FolderOpen, color: "text-primary" },
    { label: "Low Stock", value: stats?.lowStock ?? 0, icon: AlertTriangle, color: "text-warning" },
    { label: "Out of Stock", value: stats?.outOfStock ?? 0, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`${c.color}`}>
                <c.icon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProducts && recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    p.stock_status === "Available" ? "bg-success/10 text-success" :
                    p.stock_status === "Limited Stock" ? "bg-warning/10 text-warning" :
                    "bg-destructive/10 text-destructive"
                  }`}>{p.stock_status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
