
-- Create transfer requests table
CREATE TABLE IF NOT EXISTS public.transfer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.inventory(id) NOT NULL,
  item_name TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  from_user_name TEXT NOT NULL,
  to_user_roll_number TEXT NOT NULL,
  to_user_name TEXT NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since we're not using auth yet)
CREATE POLICY "Allow all operations on transfer_requests" ON public.transfer_requests FOR ALL USING (true);

-- Add transfer_request type to notifications
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('issue', 'return_request', 'transfer_request'));
