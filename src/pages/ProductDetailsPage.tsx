import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Monitor, ChevronLeft, ChevronRight } from "lucide-react";
import StockBadge from "@/components/StockBadge";
import InquiryModal from "@/components/InquiryModal";
import { useState } from "react";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [imgIdx, setImgIdx] = useState(0);

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

  const images = product?.images?.filter(Boolean) ?? [];

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
        {/* Image carousel */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <>
                <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((p) => (p === 0 ? images.length - 1 : p - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow hover:bg-background transition"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setImgIdx((p) => (p === images.length - 1 ? 0 : p + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow hover:bg-background transition"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`w-2.5 h-2.5 rounded-full transition ${i === imgIdx ? "bg-primary" : "bg-background/60"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <Monitor className="h-24 w-24 text-muted-foreground/20" />
            )}
          </div>
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 shrink-0 transition ${i === imgIdx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
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
            {product.stock_status === "Out of Stock" ? (
              <div
                aria-disabled="true"
                className="inline-block w-full sm:w-auto text-center px-8 py-3 rounded-md bg-destructive/10 text-destructive font-semibold tracking-wide uppercase border border-destructive/30 cursor-not-allowed select-none"
              >
                Sold Out
              </div>
            ) : (
              <InquiryModal
                productName={product.name}
                trigger={<Button size="lg" className="w-full sm:w-auto">Inquire Now</Button>}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
