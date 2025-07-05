
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Link as LinkIcon, Users, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';

interface User {
  id: string;
  rollNumber: string;
  name: string;
  phoneNumber: string;
  roomNumber: string;
  password: string;
  registeredDate: string;
}

interface EventNotificationsProps {
  isAdmin: boolean;
  currentUser: User | null;
}

const EventNotifications: React.FC<EventNotificationsProps> = ({ isAdmin, currentUser }) => {
  const { events, eventRegistrations, loading, addEvent, registerForEvent, deleteEvent } = useEvents();
  const [showDialog, setShowDialog] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    link: '',
    max_participants: null as number | null
  });

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) {
      return;
    }

    try {
      await addEvent(newEvent);
      setNewEvent({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        link: '',
        max_participants: null
      });
      setShowAddEvent(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleRegisterForEvent = async (eventId: string) => {
    if (!currentUser) return;
    
    try {
      await registerForEvent(eventId, currentUser.rollNumber, currentUser.name);
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const isUserRegistered = (eventId: string) => {
    if (!currentUser) return false;
    return eventRegistrations.some(reg => 
      reg.event_id === eventId && reg.user_id === currentUser.rollNumber
    );
  };

  const getRegistrationCount = (eventId: string) => {
    return eventRegistrations.filter(reg => reg.event_id === eventId).length;
  };

  const upcomingEvents = events.filter(event => new Date(event.event_date) >= new Date());
  const hasNewEvents = upcomingEvents.length > 0;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-purple-500 text-purple-600 hover:bg-purple-50 relative"
        >
          <Calendar className="h-4 w-4" />
          {hasNewEvents && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-purple-500">
              {upcomingEvents.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Hall-3 Events
            </span>
            {isAdmin && (
              <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-purple-600">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        className="border-gray-300 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                        className="border-gray-300 focus:border-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Event Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newEvent.event_date}
                          onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                          className="border-gray-300 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Event Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newEvent.event_time}
                          onChange={(e) => setNewEvent({...newEvent, event_time: e.target.value})}
                          className="border-gray-300 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                        className="border-gray-300 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link">Event Link (Optional)</Label>
                      <Input
                        id="link"
                        type="url"
                        value={newEvent.link}
                        onChange={(e) => setNewEvent({...newEvent, link: e.target.value})}
                        className="border-gray-300 focus:border-purple-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        value={newEvent.max_participants || ''}
                        onChange={(e) => setNewEvent({...newEvent, max_participants: e.target.value ? parseInt(e.target.value) : null})}
                        className="border-gray-300 focus:border-purple-500"
                      />
                    </div>
                    <Button onClick={handleAddEvent} className="w-full bg-gradient-to-r from-purple-500 to-purple-600">
                      Create Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No upcoming events at the moment.</p>
              {isAdmin && <p className="text-sm text-gray-500 mt-2">Create your first event using the "Add Event" button above.</p>}
            </div>
          ) : (
            upcomingEvents.map((event) => {
              const registrationCount = getRegistrationCount(event.id);
              const isRegistered = isUserRegistered(event.id);
              const isFull = event.max_participants && registrationCount >= event.max_participants;
              
              return (
                <Card key={event.id} className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-purple-700">{event.title}</CardTitle>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.description && (
                      <p className="text-gray-600 text-sm">{event.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </div>
                      {event.event_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.event_time}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {registrationCount} registered
                        {event.max_participants && ` / ${event.max_participants}`}
                      </div>
                    </div>

                    {event.link && (
                      <div>
                        <a 
                          href={event.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Event Link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {isRegistered ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          ✓ Registered
                        </Badge>
                      ) : currentUser ? (
                        <Button
                          size="sm"
                          onClick={() => handleRegisterForEvent(event.id)}
                          disabled={isFull}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                        >
                          {isFull ? 'Event Full' : 'Register'}
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Sign in to register
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventNotifications;
