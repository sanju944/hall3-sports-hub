
-- Create transfer_requests table
CREATE TABLE public.transfer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.inventory(id) NOT NULL,
  item_name TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  from_user_name TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  to_user_name TEXT NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for transfer requests
CREATE POLICY "Allow all operations on transfer_requests" 
  ON public.transfer_requests 
  FOR ALL 
  USING (true);

-- Create a function to handle transfer request notifications
CREATE OR REPLACE FUNCTION public.handle_transfer_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the recipient user about the transfer request
  INSERT INTO public.notifications (type, message, read, data)
  VALUES (
    'transfer_request',
    'Transfer request: ' || NEW.item_name || ' from ' || NEW.from_user_name || ' (' || NEW.from_user_id || ')',
    false,
    jsonb_build_object(
      'transfer_id', NEW.id,
      'item_name', NEW.item_name,
      'from_user_name', NEW.from_user_name,
      'from_user_id', NEW.from_user_id,
      'to_user_name', NEW.to_user_name,
      'to_user_id', NEW.to_user_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transfer request notifications
CREATE TRIGGER transfer_request_notification_trigger
  AFTER INSERT ON public.transfer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transfer_request_notification();
