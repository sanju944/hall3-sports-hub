
-- Create events table for admin to post events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  link TEXT,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL, -- Using roll_number as user identifier
  user_name TEXT NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for events (everyone can read, but we'll handle admin creation in code)
CREATE POLICY "Everyone can view events" 
  ON public.events 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow all operations on events" 
  ON public.events 
  FOR ALL 
  USING (true);

-- Create policies for event registrations
CREATE POLICY "Everyone can view event registrations" 
  ON public.event_registrations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow all operations on event_registrations" 
  ON public.event_registrations 
  FOR ALL 
  USING (true);
