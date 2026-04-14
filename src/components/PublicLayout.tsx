import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone, Mail, MapPin, ExternalLink, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import rwLogo from "@/assets/rw-logo.jpg";

const FB_PAGE = "https://www.facebook.com/profile.php?id=61575260983217";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top info bar */}
      <div className="bg-primary text-primary-foreground text-xs py-2">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> 09687262353
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Mail className="h-3 w-3" /> rwpctrading@gmail.com
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Mon–Sat 9AM–7PM
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={rwLogo} alt="RW PC Trading" className="w-10 h-10 rounded-lg object-cover" />
            <div>
              <span className="font-display font-bold text-base leading-tight block">RW PC Trading</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Computer Parts & Services</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const isActive = l.to === "/" ? location.pathname === "/" : location.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link to="/admin">
                <Button size="sm" className="ml-2">Admin Panel</Button>
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t bg-card px-4 pb-4 space-y-1">
            {navLinks.map((l) => {
              const isActive = l.to === "/" ? location.pathname === "/" : location.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full mt-2">Admin Panel</Button>
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={rwLogo} alt="RW PC Trading" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-display font-bold">RW PC Trading</span>
              </div>
              <p className="text-sm text-sidebar-foreground/70 mb-3">
                Brand-new Computer and Laptop Parts and Accessories. Also available Repair Services and Installations.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="space-y-2">
                {navLinks.map((l) => (
                  <Link key={l.to} to={l.to} className="block text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-sidebar-foreground/70">
                <p className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /> 09687262353</p>
                <p className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /> rwpctrading@gmail.com</p>
                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> Unit 2B 2nd Floor One Santiago Place Building, Gov. I. Santiago St., Brgy. Malinta, Valenzuela City</p>
                <a href={FB_PAGE} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sidebar-foreground transition-colors">
                  <ExternalLink className="h-4 w-4 shrink-0" /> RW PC Trading
                </a>
              </div>
            </div>

            {/* Hours & Payment */}
            <div>
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider mb-4">Store Hours</h4>
              <div className="space-y-2 text-sm text-sidebar-foreground/70">
                <p className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 shrink-0" /> Monday – Saturday</p>
                <p className="ml-6">9:00 AM – 7:00 PM</p>
                <p className="text-xs mt-3 font-semibold text-sidebar-foreground/90 uppercase tracking-wide">Installment Available</p>
                <p className="flex items-start gap-2"><CreditCard className="h-4 w-4 mt-0.5 shrink-0" /> Salmon Financing, Credit Card (Mastercard, Visa, JCB), E-Wallet (GCash, Maya, ShopeePay, GrabPay, AliPay, etc.)</p>
              </div>
            </div>
          </div>

          <div className="border-t border-sidebar-border pt-6 text-center text-xs text-sidebar-foreground/50">
            © {new Date().getFullYear()} RW PC Trading. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
