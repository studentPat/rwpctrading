
DROP POLICY "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback" ON public.feedback
  FOR INSERT WITH CHECK (name IS NOT NULL AND length(name) > 0 AND message IS NOT NULL AND length(message) > 0);
