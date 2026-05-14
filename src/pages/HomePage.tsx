import { Link } from "react-router-dom";
import { Monitor, Wrench, ShieldCheck, ArrowRight, Star, Cpu, CreditCard, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StockBadge from "@/components/StockBadge";
import InquiryModal from "@/components/InquiryModal";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Cpu, title: "Quality Parts", desc: "Brand-new components from trusted brands" },
  { icon: Wrench, title: "Expert Repairs", desc: "Professional technicians for any issue" },
  { icon: ShieldCheck, title: "Warranty Support", desc: "Products backed with warranty coverage" },
  { icon: CreditCard, title: "Installment Available", desc: "Salmon Financing, Credit Card & E-Wallet" },
];

export default function HomePage() {
  const { data: featuredProducts } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  const { data: services } = useQuery({
    queryKey: ["home-services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(4);
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

  const isIconUrl = (icon: string | null) => icon?.startsWith("http");

  return (
    <div>
      {/* Hero */}
      <section className="relative text-primary-foreground py-24 md:py-36">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,25%,12%)/0.9] to-[hsl(215,25%,12%)/0.6]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Your Trusted <span className="text-gradient bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">Computer Shop</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Brand-new Computer and Laptop Parts and Accessories. Also available Repair Services and Installations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalog">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Browse Products
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Our Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-6 border-b bg-card shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-background to-accent/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl md:text-3xl font-bold">Featured Products</h2>
              <Link to="/catalog" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-muted-foreground mb-8">Browse our latest computer parts and accessories</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 border-border/50">
                  <div className="relative aspect-square bg-muted flex items-center justify-center">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Monitor className="h-16 w-16 text-muted-foreground/20" />
                    )}
                    <div className="absolute top-3 right-3">
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
                    <div className="flex gap-2 mt-3">
                      <InquiryModal
                        productName={p.name}
                        trigger={<Button size="sm" className="flex-1">Inquire Now</Button>}
                      />
                      <Link to={`/catalog/${p.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {services && services.length > 0 && (
        <section className="py-16 bg-accent/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">Our Services</h2>
            <p className="text-muted-foreground text-center mb-10">Professional repair and installation services</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((s) => (
                <Card key={s.id} className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent overflow-hidden">
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg ring-4 ring-background overflow-hidden">
                      {isIconUrl(s.icon) ? (
                        <img src={s.icon!} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <Wrench className="h-7 w-7 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                  <CardContent className="pt-10 pb-6 px-6 text-center">
                    <h3 className="font-display font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{s.description}</p>
                    <InquiryModal
                      productName={s.title}
                      trigger={<Button size="sm" className="hover:scale-105 transition-transform">Inquire Now</Button>}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/services" className="text-primary text-sm font-medium hover:underline">
                View All Services →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {reviews.map((r) => (
                <Card key={r.id} className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-video w-full bg-muted overflow-hidden flex items-center justify-center">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={`Review by ${r.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground mb-4">"{r.comment}"</p>}
                    <p className="font-medium text-sm">— {r.name}</p>
                  </div>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/reviews" className="text-primary text-sm font-medium hover:underline">
                See All Reviews →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
