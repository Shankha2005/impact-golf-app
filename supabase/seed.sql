-- Insert initial charities for testing (run after migrations 0001 and 0002)
-- Uses ON CONFLICT to upsert by slug so seed is re-runnable
INSERT INTO public.charities (name, description, slug, is_featured, upcoming_events)
VALUES 
('Global Golf Foundation', 'Supporting youth golf programs in underserved communities. We provide equipment, coaching, and access to courses for young people who would not otherwise have the opportunity to play.', 'global-golf-foundation', true, 
  '[{"name":"Annual Charity Golf Day","date":"2026-05-15","location":"Pebble Beach"},{"name":"Junior Championship","date":"2026-07-20","location":"Augusta"}]'::jsonb),
('Green Fairways Initiative', 'Promoting sustainable and eco-friendly course management. Our mission is to help golf courses reduce water usage, chemical treatments, and carbon footprint while maintaining playable greens.', 'green-fairways-initiative', false,
  '[{"name":"Eco Course Summit","date":"2026-06-10","location":"Virtual"}]'::jsonb),
('Veterans on the Green', 'Using the game as physical and mental therapy for veterans. Golf provides rehabilitation, camaraderie, and a pathway to wellness for those who have served our country.', 'veterans-on-the-green', true,
  '[{"name":"Veterans Memorial Tournament","date":"2026-11-11","location":"Arlington"},{"name":"Monthly Meetup","date":"2026-04-01","location":"Local courses nationwide"}]'::jsonb),
('First Tee Foundation', 'Building character through golf. We use the game to teach life skills and values to young people in under-resourced communities.', 'first-tee-foundation', true,
  '[{"name":"Character Day Golf Camp","date":"2026-08-01","location":"Multiple locations"}]'::jsonb),
('Children''s Hospital Golf Classic', 'Raising funds for pediatric care through golf events. Every swing helps fund critical treatments and research for children fighting illness.', 'childrens-hospital-golf', false,
  '[{"name":"Annual Golf Classic","date":"2026-09-18","location":"Pinehurst"}]'::jsonb),
('Habitat for Humanity Golf Build', 'Combining golf fundraising with hands-on home building. Proceeds help families achieve affordable homeownership.', 'habitat-golf-build', false,
  '[]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_featured = EXCLUDED.is_featured,
  upcoming_events = EXCLUDED.upcoming_events;