
-- The transfer_requests table already exists, let me just add a trigger to populate transfer notifications
CREATE OR REPLACE FUNCTION handle_transfer_request_notification()
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
DROP TRIGGER IF EXISTS transfer_request_notification_trigger ON public.transfer_requests;
CREATE TRIGGER transfer_request_notification_trigger
  AFTER INSERT ON public.transfer_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_transfer_request_notification();
