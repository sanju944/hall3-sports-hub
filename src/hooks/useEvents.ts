
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  link: string | null;
  max_participants: number | null;
  created_at: string;
  updated_at: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  registered_at: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    }
  };

  const fetchEventRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*');

      if (error) throw error;
      setEventRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching event registrations:', error);
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchEvents();
      return data;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const registerForEvent = async (eventId: string, userId: string, userName: string) => {
    try {
      // Check if user is already registered
      const { data: existingRegistration } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_id: userId,
          user_name: userName
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchEventRegistrations();
      toast({
        title: "Registration Successful",
        description: "You have been registered for the event",
      });
      
      return data;
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      await fetchEvents();
      toast({
        title: "Event Deleted",
        description: "Event has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete event",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchEventRegistrations()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    events,
    eventRegistrations,
    loading,
    addEvent,
    registerForEvent,
    deleteEvent,
    fetchEvents,
    fetchEventRegistrations
  };
};
