import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Monitor, Search } from "lucide-react";
import StockBadge from "@/components/StockBadge";
import InquiryModal from "@/components/InquiryModal";

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [priceEnabled, setPriceEnabled] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("is_active", true);
      return data ?? [];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search, categoryFilter, stockFilter, priceRange, priceEnabled],
    queryFn: async () => {
      let q = supabase.from("products").select("*, categories(name)").eq("is_archived", false);
      if (search) q = q.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
      if (categoryFilter !== "all") q = q.eq("category_id", categoryFilter);
      if (stockFilter !== "all") q = q.eq("stock_status", stockFilter);
      if (priceEnabled) {
        q = q.gte("price", priceRange[0]).lte("price", priceRange[1]);
      }
      const { data } = await q.order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMC0yIDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Product Catalog</h1>
          <p className="opacity-80">Browse our complete collection of computer parts and accessories</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Limited Stock">Limited Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Price range */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={priceEnabled}
                onChange={(e) => setPriceEnabled(e.target.checked)}
                className="rounded border-border"
              />
              Filter by Price
            </label>
            {priceEnabled && (
              <div className="flex items-center gap-3 flex-1 min-w-[250px]">
                <span className="text-xs text-muted-foreground whitespace-nowrap">₱{priceRange[0].toLocaleString()}</span>
                <Slider
                  min={0}
                  max={500000}
                  step={1000}
                  value={priceRange}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">₱{priceRange[1].toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => {
              const isSoldOut = p.stock_status === "Out of Stock";
              return (
              <Card key={p.id} className={`group overflow-hidden border-border/50 transition-all ${isSoldOut ? "opacity-75" : "hover:shadow-lg hover:-translate-y-0.5"}`}>
                <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} className={`w-full h-full object-cover transition-transform duration-500 ${isSoldOut ? "grayscale" : "group-hover:scale-105"}`} loading="lazy" />
                  ) : (
                    <Monitor className="h-16 w-16 text-muted-foreground/20" />
                  )}
                  {isSoldOut && <div className="absolute inset-0 bg-background/40" />}
                  <div className="absolute top-3 right-3 z-10">
                    <StockBadge status={p.stock_status} />
                  </div>
                </div>
                <CardContent className="p-4">
                  {(p.categories as any)?.name && (
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{(p.categories as any).name}</p>
                  )}
                  <h3 className="font-semibold text-sm mb-0.5">{p.name}</h3>
                  {p.brand && <p className="text-xs text-muted-foreground">{p.brand} {p.model && `• ${p.model}`}</p>}
                  {p.show_price && p.price && (
                    <p className="font-display font-bold text-primary mt-2">₱{Number(p.price).toLocaleString()}</p>
                  )}
                  <div className="mt-3">
                    {isSoldOut ? (
                      <div
                        aria-disabled="true"
                        className="w-full text-center py-2 rounded-md bg-destructive/10 text-destructive font-semibold text-sm tracking-wide uppercase border border-destructive/30 cursor-not-allowed select-none"
                      >
                        Sold Out
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <InquiryModal productName={p.name} trigger={<Button size="sm" className="flex-1">Inquire Now</Button>} />
                        <Link to={`/catalog/${p.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">Details</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Monitor className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-1">No Products Found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
