import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type InventoryItem = Database['public']['Tables']['inventory']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Issue = Database['public']['Tables']['issues']['Row'];
type ReturnRequest = Database['public']['Tables']['return_requests']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type AuthorizedStudent = Database['public']['Tables']['authorized_students']['Row'];
type TransferRequest = Database['public']['Tables']['transfer_requests']['Row'];

export const useSupabaseData = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [authorizedStudents, setAuthorizedStudents] = useState<AuthorizedStudent[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchAllData = async () => {
    try {
      const [
        inventoryData,
        usersData,
        issuesData,
        returnRequestsData,
        notificationsData,
        authorizedData,
        transferRequestsData
      ] = await Promise.all([
        supabase.from('inventory').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('issues').select('*').order('created_at', { ascending: false }),
        supabase.from('return_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('authorized_students').select('*'),
        supabase.from('transfer_requests').select('*').order('created_at', { ascending: false })
      ]);

      if (inventoryData.data) setInventory(inventoryData.data);
      if (usersData.data) setUsers(usersData.data);
      if (issuesData.data) setIssues(issuesData.data);
      if (returnRequestsData.data) setReturnRequests(returnRequestsData.data);
      if (notificationsData.data) setNotifications(notificationsData.data);
      if (authorizedData.data) setAuthorizedStudents(authorizedData.data);
      if (transferRequestsData.data) setTransferRequests(transferRequestsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to inventory changes
    const inventoryChannel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, 
        (payload) => {
          console.log('Inventory change:', payload);
          if (payload.eventType === 'INSERT') {
            setInventory(prev => [payload.new as InventoryItem, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setInventory(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new as InventoryItem : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setInventory(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to issues changes
    const issuesChannel = supabase
      .channel('issues-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, 
        (payload) => {
          console.log('Issues change:', payload);
          if (payload.eventType === 'INSERT') {
            setIssues(prev => [payload.new as Issue, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIssues(prev => prev.map(issue => 
              issue.id === payload.new.id ? payload.new as Issue : issue
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to notifications changes
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, 
        (payload) => {
          console.log('Notifications change:', payload);
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => prev.map(notif => 
              notif.id === payload.new.id ? payload.new as Notification : notif
            ));
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(notif => notif.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to return requests changes
    const returnRequestsChannel = supabase
      .channel('return-requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'return_requests' }, 
        (payload) => {
          console.log('Return requests change:', payload);
          if (payload.eventType === 'INSERT') {
            setReturnRequests(prev => [payload.new as ReturnRequest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setReturnRequests(prev => prev.map(req => 
              req.id === payload.new.id ? payload.new as ReturnRequest : req
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to users changes
    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, 
        (payload) => {
          console.log('Users change:', payload);
          if (payload.eventType === 'INSERT') {
            setUsers(prev => [payload.new as User, ...prev]);
          }
        }
      )
      .subscribe();

    // Subscribe to authorized students changes
    const authorizedChannel = supabase
      .channel('authorized-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'authorized_students' }, 
        (payload) => {
          console.log('Authorized students change:', payload);
          if (payload.eventType === 'INSERT') {
            setAuthorizedStudents(prev => [...prev, payload.new as AuthorizedStudent]);
          }
        }
      )
      .subscribe();

    // Subscribe to transfer requests changes
    const transferRequestsChannel = supabase
      .channel('transfer-requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfer_requests' }, 
        (payload) => {
          console.log('Transfer requests change:', payload);
          if (payload.eventType === 'INSERT') {
            setTransferRequests(prev => [payload.new as TransferRequest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTransferRequests(prev => prev.map(req => 
              req.id === payload.new.id ? payload.new as TransferRequest : req
            ));
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(issuesChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(returnRequestsChannel);
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(authorizedChannel);
      supabase.removeChannel(transferRequestsChannel);
    };
  };

  // Database operations
  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('inventory').insert([item]);
    if (error) throw error;
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    const { error } = await supabase.from('inventory').update(updates).eq('id', id);
    if (error) throw error;
  };

  const deleteInventoryItem = async (id: string) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) throw error;
  };

  const addUser = async (user: Omit<User, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('users').insert([user]);
    if (error) throw error;
  };

  const addIssue = async (issue: Omit<Issue, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('issues').insert([issue]);
    if (error) throw error;
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    const { error } = await supabase.from('issues').update(updates).eq('id', id);
    if (error) throw error;
  };

  const addReturnRequest = async (request: Omit<ReturnRequest, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('return_requests').insert([request]);
    if (error) throw error;
  };

  const updateReturnRequest = async (id: string, updates: Partial<ReturnRequest>) => {
    const { error } = await supabase.from('return_requests').update(updates).eq('id', id);
    if (error) throw error;
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('notifications').insert([notification]);
    if (error) throw error;
  };

  const updateNotification = async (id: string, updates: Partial<Notification>) => {
    const { error } = await supabase.from('notifications').update(updates).eq('id', id);
    if (error) throw error;
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
  };

  const addAuthorizedStudents = async (students: Omit<AuthorizedStudent, 'id' | 'created_at'>[]) => {
    const { error } = await supabase.from('authorized_students').insert(students);
    if (error) throw error;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (error) throw error;
  };

  const addTransferRequest = async (request: Omit<TransferRequest, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('transfer_requests').insert([request]);
    if (error) throw error;
  };

  const updateTransferRequest = async (id: string, updates: Partial<TransferRequest>) => {
    const { error } = await supabase.from('transfer_requests').update(updates).eq('id', id);
    if (error) throw error;
  };

  return {
    // Data
    inventory,
    users,
    issues,
    returnRequests,
    notifications,
    authorizedStudents,
    transferRequests,
    loading,
    
    // Operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addUser,
    updateUser,
    addIssue,
    updateIssue,
    addReturnRequest,
    updateReturnRequest,
    addNotification,
    updateNotification,
    deleteNotification,
    addAuthorizedStudents,
    addTransferRequest,
    updateTransferRequest,
    
    // Utilities
    refreshData: fetchAllData
  };
};
