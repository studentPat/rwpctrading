-- Allow anyone to submit a review (pending approval)
CREATE POLICY "Anyone can submit a review"
ON public.reviews
FOR INSERT
TO public
WITH CHECK (
  is_approved = false
  AND name IS NOT NULL
  AND length(name) > 0
  AND rating >= 1
  AND rating <= 5
);
