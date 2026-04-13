
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Wrench',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage services"
ON public.services
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
TO public
USING (is_active = true);

-- Seed default services
INSERT INTO public.services (title, description, icon, sort_order) VALUES
('Laptop Repair', 'Screen replacement, keyboard repair, battery replacement, and general troubleshooting for all laptop brands.', 'Laptop', 1),
('PC Assembly', 'Custom PC building service. Bring your own parts or let us source them for you. Includes cable management and testing.', 'Monitor', 2),
('Software Installation', 'Operating system installation, driver updates, software setup, and system optimization.', 'Settings', 3),
('Cleaning & Maintenance', 'Deep cleaning of desktops and laptops, thermal paste replacement, dust removal, and performance check.', 'Paintbrush', 4),
('Hardware Upgrade', 'RAM upgrade, SSD installation, GPU replacement, and other hardware upgrades for desktops and laptops.', 'Cpu', 5);
