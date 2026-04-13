import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Monitor } from "lucide-react";
import StockBadge from "@/components/StockBadge";
import InquiryModal from "@/components/InquiryModal";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-xl font-bold mb-2">Product Not Found</h2>
        <Link to="/catalog"><Button variant="outline">Back to Catalog</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/catalog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Monitor className="h-24 w-24 text-muted-foreground/20" />
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start gap-3 mb-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold">{product.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StockBadge status={product.stock_status} />
            {(product.categories as any)?.name && (
              <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                {(product.categories as any).name}
              </span>
            )}
          </div>

          {product.brand && <p className="text-sm text-muted-foreground mb-1"><strong>Brand:</strong> {product.brand}</p>}
          {product.model && <p className="text-sm text-muted-foreground mb-1"><strong>Model:</strong> {product.model}</p>}
          {product.warranty && <p className="text-sm text-muted-foreground mb-1"><strong>Warranty:</strong> {product.warranty}</p>}

          {product.show_price && product.price && (
            <p className="font-display text-2xl font-bold text-primary mt-4">₱{Number(product.price).toLocaleString()}</p>
          )}

          {product.description && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="mt-8">
            <InquiryModal
              productName={product.name}
              trigger={<Button size="lg" className="w-full sm:w-auto">Inquire Now</Button>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
