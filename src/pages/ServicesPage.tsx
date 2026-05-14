import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import InquiryModal from "@/components/InquiryModal";
import { Button } from "@/components/ui/button";
import { Wrench, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { renderServiceIcon } from "@/pages/admin/AdminServices";

export default function ServicesPage() {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMC0yIDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Our Services</h1>
          <p className="opacity-80 max-w-xl mx-auto">
            Professional repair and installation services for computers, laptops, and peripherals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="w-14 h-14 bg-muted rounded-full mx-auto mb-4" />
                <div className="h-5 bg-muted rounded w-1/2 mx-auto mb-2" />
                <div className="h-3 bg-muted rounded w-3/4 mx-auto" />
              </Card>
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full rounded-lg group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent overflow-hidden rounded-t-lg">
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="relative flex justify-center -mt-8 z-10">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg ring-4 ring-background overflow-hidden group-hover:scale-110 transition-transform duration-300">
                      {renderServiceIcon(s.icon, "h-8 w-8 text-primary-foreground")}
                    </div>
                  </div>
                  <CardContent className="pt-4 pb-6 px-6 text-center">
                    <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5 line-clamp-3">{s.description}</p>
                    <InquiryModal
                      productName={s.title}
                      trigger={<Button size="sm" className="hover:scale-105 transition-transform">Inquire Now</Button>}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Wrench className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No services available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
