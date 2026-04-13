import { Link } from "react-router-dom";
import { Monitor, Wrench, Cpu, ShieldCheck, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StockBadge from "@/components/StockBadge";
import InquiryModal from "@/components/InquiryModal";

const features = [
  { icon: Cpu, title: "Quality Parts", desc: "Brand-new components from trusted brands" },
  { icon: Wrench, title: "Expert Repairs", desc: "Professional technicians for all repairs" },
  { icon: ShieldCheck, title: "Warranty", desc: "Products backed with warranty coverage" },
  { icon: Monitor, title: "Full Service", desc: "From assembly to software installation" },
];

export default function HomePage() {
  const { data: featuredProducts } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("is_archived", false)
        .limit(6);
      return data ?? [];
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["home-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Computer Repairs & Parts
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Brand-new Computer and Laptop Parts & Accessories. Professional Repair Services & Installations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalog">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Browse Products <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Our Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mx-auto mb-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold">Featured Products</h2>
              <Link to="/catalog" className="text-primary text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((p) => (
                <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Monitor className="h-12 w-12 text-muted-foreground/30" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{p.name}</h3>
                      <StockBadge status={p.stock_status} />
                    </div>
                    {p.brand && <p className="text-xs text-muted-foreground mb-1">{p.brand}</p>}
                    {p.show_price && p.price && (
                      <p className="font-display font-bold text-primary">₱{Number(p.price).toLocaleString()}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Link to={`/catalog/${p.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">Details</Button>
                      </Link>
                      <InquiryModal
                        productName={p.name}
                        trigger={<Button size="sm" className="flex-1">Inquire</Button>}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-8 text-center">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {reviews.map((r) => (
                <Card key={r.id} className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">"{r.comment}"</p>
                  <p className="font-medium text-sm">{r.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold mb-3">Need Help?</h2>
          <p className="text-muted-foreground mb-6">Contact us for inquiries about products, repairs, or services.</p>
          <Link to="/contact">
            <Button size="lg">Get In Touch</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
