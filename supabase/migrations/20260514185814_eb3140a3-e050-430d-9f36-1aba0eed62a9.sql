
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS image_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Review images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

CREATE POLICY "Admins can upload review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'review-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete review images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'review-images' AND public.has_role(auth.uid(), 'admin'));
