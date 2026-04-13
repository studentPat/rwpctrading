import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

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
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Monitor className="h-7 w-7 text-primary" />
            <span className="font-display font-bold text-lg">RW PC Trading</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin">
                <Button size="sm" className="ml-2">Admin Panel</Button>
              </Link>
            )}
            {!user && (
              <Link to="/login">
                <Button variant="outline" size="sm" className="ml-2">Login</Button>
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
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === l.to
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full mt-2">Admin Panel</Button>
              </Link>
            )}
            {!user && (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full mt-2">Login</Button>
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold text-foreground mb-1">RW PC Trading</p>
          <p>Brand-new Computer and Laptop Parts & Accessories</p>
          <p className="mt-1">Repair Services & Installations</p>
          <p className="mt-4">© {new Date().getFullYear()} RW PC Trading. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
