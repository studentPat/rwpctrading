-- Align product defaults with initial stock quantity
ALTER TABLE public.products
  ALTER COLUMN stock_quantity SET DEFAULT 1;

ALTER TABLE public.products
  ALTER COLUMN stock_status SET DEFAULT 'Limited Stock';
