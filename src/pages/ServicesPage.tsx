import { Card, CardContent } from "@/components/ui/card";
import InquiryModal from "@/components/InquiryModal";
import { Button } from "@/components/ui/button";
import { Wrench, Monitor, HardDrive, Cpu, Settings, Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { icon: Wrench, title: "Laptop Repair", desc: "Screen replacement, keyboard repair, motherboard diagnostics, and more." },
  { icon: Monitor, title: "PC Assembly", desc: "Custom-built desktop PCs tailored to your needs and budget." },
  { icon: HardDrive, title: "Software Installation", desc: "OS installation, driver setup, and software configuration." },
  { icon: Paintbrush, title: "Cleaning & Maintenance", desc: "Deep cleaning, thermal paste replacement, and preventive maintenance." },
  { icon: Cpu, title: "Hardware Upgrade", desc: "RAM, SSD, GPU, and other component upgrades for better performance." },
  { icon: Settings, title: "General Troubleshooting", desc: "Diagnosing and fixing software and hardware issues." },
];

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Our Services</h1>
      <p className="text-muted-foreground mb-8">Professional repair and installation services for your computers and laptops.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
                <InquiryModal
                  productName={s.title}
                  trigger={<Button variant="outline" size="sm">Inquire Now</Button>}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
