
-- Create transfer requests table
CREATE TABLE public.transfer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.inventory(id) NOT NULL,
  item_name TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  from_user_name TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  to_user_name TEXT NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on transfer_requests" ON public.transfer_requests FOR ALL USING (true);

-- Enable real-time for transfer requests
ALTER TABLE public.transfer_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transfer_requests;

-- Update notifications table to support transfer requests
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('issue', 'return_request', 'transfer_request'));
